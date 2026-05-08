import express from 'express';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const HAS_API_KEY = !!process.env.ANTHROPIC_API_KEY;
const anthropic = HAS_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'project')));

// Root → open app directly
app.get('/', (_req, res) => res.redirect('/xtract.html'));

const EXTRACTION_TOOL = {
  name: 'extract_freight_document',
  description: 'Extract all structured data fields from an Indian freight document (invoice, lorry receipt, or proof of delivery).',
  input_schema: {
    type: 'object',
    properties: {
      doc_type: { type: 'string', enum: ['invoice', 'lorry', 'pod'] },
      type_label: { type: 'string', description: 'Human-readable document type label' },
      field_groups: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            group: { type: 'string' },
            fields: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key:        { type: 'string' },
                  label:      { type: 'string' },
                  value:      { type: 'string' },
                  confidence: { type: 'number', minimum: 0, maximum: 1 },
                  bbox:       { type: 'array', items: { type: 'number' }, minItems: 4, maxItems: 4 },
                },
                required: ['key', 'label', 'value', 'confidence', 'bbox'],
                additionalProperties: false,
              },
            },
          },
          required: ['group', 'fields'],
          additionalProperties: false,
        },
      },
    },
    required: ['doc_type', 'type_label', 'field_groups'],
    additionalProperties: false,
  },
};

const EXTRACTION_PROMPT = `You are an AI extraction engine for Indian freight documents. Analyze this document carefully and extract all data fields using the extract_freight_document tool.

First, identify the document type:
- "invoice" = Commercial Invoice or Freight Invoice (has invoice number, GSTIN, freight charges)
- "lorry" = Lorry Receipt / Truck Receipt / GR (Goods Receipt) — issued by transporter
- "pod" = Proof of Delivery / Delivery Receipt — signed by recipient

For each field provide:
- key: snake_case identifier (e.g. "invoice_no", "consignee_gstin")
- label: Human-readable name
- value: The exact text from the document. Use "—" if completely absent or illegible.
- confidence: 0.95+ crystal clear; 0.75–0.95 minor uncertainty; 0.50–0.75 unclear; <0.50 guessed
- bbox: [x_percent, y_percent, width_percent, height_percent] — approximate position on page

Group by type:
· Invoice: "Document", "Parties", "Freight", "Charges"
· Lorry Receipt: "Document", "Parties", "Vehicle", "Goods", "Charges"
· POD: "Document", "Reference", "Delivery", "Condition", "Verification"

Be thorough — extract every visible field.`;

async function extractDocument(fileBuffer, mimeType, filename) {
  const base64 = fileBuffer.toString('base64');

  // Normalise mime type — Windows sometimes sends wrong types
  let resolvedMime = mimeType;
  if (!resolvedMime || resolvedMime === 'application/octet-stream') {
    const lower = (filename || '').toLowerCase();
    if (lower.endsWith('.pdf'))  resolvedMime = 'application/pdf';
    else if (lower.endsWith('.png'))  resolvedMime = 'image/png';
    else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) resolvedMime = 'image/jpeg';
    else if (lower.endsWith('.tif') || lower.endsWith('.tiff')) resolvedMime = 'image/tiff';
    else resolvedMime = 'image/jpeg';
  }

  const isPDF = resolvedMime === 'application/pdf';

  const contentBlock = isPDF
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
    : { type: 'image',    source: { type: 'base64', media_type: resolvedMime,       data: base64 } };

  const params = {
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    system: EXTRACTION_PROMPT,
    tools: [EXTRACTION_TOOL],
    tool_choice: { type: 'tool', name: 'extract_freight_document' },
    messages: [{ role: 'user', content: [contentBlock] }],
  };

  const response = isPDF
    ? await anthropic.beta.messages.create({ ...params, betas: ['pdfs-2024-09-25'] })
    : await anthropic.messages.create(params);

  const toolUse = response.content.find(b => b.type === 'tool_use');
  if (!toolUse) throw new Error('Claude did not call the extraction tool');
  return { data: toolUse.input, usage: response.usage };
}

app.post('/api/extract-batch', upload.array('files', 100), async (req, res) => {
  if (!HAS_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY is not configured on the server. Use browser extraction instead.' });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const results = [];
  const now = Date.now();

  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    console.log(`[${i + 1}/${req.files.length}] Extracting ${file.originalname}…`);
    try {
      const { data: extracted, usage } = await extractDocument(file.buffer, file.mimetype, file.originalname);
      const ts = new Date().toLocaleString('en-IN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }).replace(',', '');

      results.push({
        id:         `DOC-${String(now + i).slice(-6)}`,
        filename:   file.originalname,
        type:       extracted.doc_type,
        typeLabel:  extracted.type_label,
        pages:      1,
        sizeKb:     Math.round(file.size / 1024),
        uploaded:   ts,
        status:     'pending',
        fields:     extracted.field_groups,
        tokenUsage: {
          input:  usage?.input_tokens  || 0,
          output: usage?.output_tokens || 0,
        },
      });
      console.log(`  ✓ ${file.originalname} → ${extracted.doc_type} (${extracted.field_groups.reduce((n, g) => n + g.fields.length, 0)} fields)`);
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
        error:     err.message,
      });
    }
  }

  res.json({ docs: results });
});

// Health check — also tells the client whether the server has an API key
app.get('/api/health', (_req, res) => res.json({ ok: true, hasApiKey: HAS_API_KEY }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\nxTract running → http://localhost:${PORT}\n`);
  if (!HAS_API_KEY) {
    console.warn('  ⚠  ANTHROPIC_API_KEY is not set.');
    console.warn('     Option 1 — set it before starting:');
    console.warn('       Windows:  set ANTHROPIC_API_KEY=sk-ant-...');
    console.warn('       Mac/Linux: export ANTHROPIC_API_KEY=sk-ant-...');
    console.warn('     Option 2 — enter your key in the browser when prompted.\n');
  } else {
    console.log('  ✓  API key found — server-side extraction ready\n');
  }
});
