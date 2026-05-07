import express from 'express';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'project')));

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    doc_type: { type: "string", enum: ["invoice", "lorry", "pod"] },
    type_label: { type: "string" },
    field_groups: {
      type: "array",
      items: {
        type: "object",
        properties: {
          group: { type: "string" },
          fields: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key:        { type: "string" },
                label:      { type: "string" },
                value:      { type: "string" },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                bbox: {
                  type: "array",
                  items: { type: "number" },
                  minItems: 4,
                  maxItems: 4,
                },
              },
              required: ["key", "label", "value", "confidence", "bbox"],
              additionalProperties: false,
            },
          },
        },
        required: ["group", "fields"],
        additionalProperties: false,
      },
    },
  },
  required: ["doc_type", "type_label", "field_groups"],
  additionalProperties: false,
};

const EXTRACTION_PROMPT = `You are an AI extraction engine for Indian freight documents. Analyze this document carefully and extract all data fields.

First, identify the document type:
- "invoice" = Commercial Invoice or Freight Invoice (has invoice number, GSTIN, freight charges)
- "lorry" = Lorry Receipt / Truck Receipt / GR (Goods Receipt) — issued by transporter
- "pod" = Proof of Delivery / Delivery Receipt — signed by recipient

Extract ALL visible text fields, organized into logical sections. For each field provide:
- key: snake_case identifier (e.g. "invoice_no", "consignee_gstin")
- label: Human-readable name (e.g. "Invoice No.", "Consignee GSTIN")
- value: The exact text from the document. Use "—" only if completely absent or illegible.
- confidence: 0.0 to 1.0 — how clear and certain is this reading?
  · 0.95+  Crystal clear, no ambiguity
  · 0.75–0.95  Clear but minor uncertainty (slight smudge or cutoff)
  · 0.50–0.75  Somewhat unclear, partial text, or inferred
  · Below 0.50  Mostly guessed, very unclear
- bbox: [x_percent, y_percent, width_percent, height_percent] — estimated position of this field's VALUE on the page as percentages of total page dimensions

Group the fields logically:
· Invoice: "Document" (no, date, PO ref), "Parties" (shipper + consignee with GSTINs), "Freight" (route, weight, vehicle), "Charges" (all line items, GST, total)
· Lorry Receipt: "Document" (LR no, date), "Parties" (consignor, consignee, from/to), "Vehicle" (vehicle no, driver), "Goods" (packages, description, weight), "Charges" (freight, advance, balance)
· POD: "Document" (POD no, delivery date/time), "Reference" (linked LR/invoice numbers), "Delivery" (delivered to, received by, address), "Condition" (packages, damages, remarks), "Verification" (signature, stamp)

Be thorough — extract every field visible on the document.`;

async function extractDocument(fileBuffer, mimeType) {
  const base64 = fileBuffer.toString('base64');
  const isPDF = mimeType === 'application/pdf';

  const contentBlock = isPDF
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
    : { type: 'image',    source: { type: 'base64', media_type: mimeType,            data: base64 } };

  const createParams = {
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    system: EXTRACTION_PROMPT,
    messages: [{ role: 'user', content: [contentBlock] }],
    output_config: {
      format: {
        type: 'json_schema',
        json_schema: { name: 'freight_document_extraction', schema: EXTRACTION_SCHEMA },
      },
    },
  };

  const betas = isPDF ? ['pdfs-2024-09-25'] : undefined;
  const response = betas
    ? await anthropic.beta.messages.create({ ...createParams, betas })
    : await anthropic.messages.create(createParams);

  const textBlock = response.content.find(b => b.type === 'text');
  return JSON.parse(textBlock.text);
}

app.post('/api/extract-batch', upload.array('files', 100), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const results = [];
  const now = Date.now();

  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    try {
      const extracted = await extractDocument(file.buffer, file.mimetype);
      const ts = new Date().toLocaleString('en-IN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }).replace(',', '');

      results.push({
        id:        `DOC-${String(now + i).slice(-6)}`,
        filename:  file.originalname,
        type:      extracted.doc_type,
        typeLabel: extracted.type_label,
        pages:     1,
        sizeKb:    Math.round(file.size / 1024),
        uploaded:  ts,
        status:    'pending',
        fields:    extracted.field_groups,
      });
      console.log(`  ✓ ${file.originalname} → ${extracted.doc_type}`);
    } catch (err) {
      console.error(`  ✗ ${file.originalname}: ${err.message}`);
      results.push({
        id:        `DOC-${String(now + i).slice(-6)}`,
        filename:  file.originalname,
        type:      'invoice',
        typeLabel: 'Invoice',
        pages:     1,
        sizeKb:    Math.round(file.size / 1024),
        uploaded:  new Date().toLocaleString('en-IN', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit',
        }).replace(',', ''),
        status:    'error',
        fields:    [],
      });
    }
  }

  res.json({ docs: results });
});

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`xTract running → http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('  ⚠  ANTHROPIC_API_KEY is not set — extraction will fail');
  }
});
