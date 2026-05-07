// Browser-side Claude API extraction — used when the Node server isn't available
// Requires the user to supply their own API key (stored in localStorage)

const EXTRACTION_SCHEMA_BROWSER = {
  type: "object",
  properties: {
    doc_type:    { type: "string", enum: ["invoice", "lorry", "pod"] },
    type_label:  { type: "string" },
    field_groups: {
      type: "array",
      items: {
        type: "object",
        properties: {
          group:  { type: "string" },
          fields: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key:        { type: "string" },
                label:      { type: "string" },
                value:      { type: "string" },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                bbox:       { type: "array", items: { type: "number" }, minItems: 4, maxItems: 4 },
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

const EXTRACTION_PROMPT_BROWSER = `You are an AI extraction engine for Indian freight documents. Analyze this document carefully and extract all data fields.

First, identify the document type:
- "invoice" = Commercial Invoice or Freight Invoice (has invoice number, GSTIN, freight charges)
- "lorry" = Lorry Receipt / Truck Receipt / GR (Goods Receipt) — issued by transporter
- "pod" = Proof of Delivery / Delivery Receipt — signed by recipient

Extract ALL visible text fields, organized into logical sections. For each field provide:
- key: snake_case identifier (e.g. "invoice_no", "consignee_gstin")
- label: Human-readable name
- value: The exact text from the document. Use "—" only if completely absent or illegible.
- confidence: 0.0–1.0 — 0.95+ crystal clear, 0.75–0.95 minor uncertainty, 0.50–0.75 unclear, <0.50 guessed
- bbox: [x_percent, y_percent, width_percent, height_percent] — approximate position on page

Group by type:
· Invoice: "Document", "Parties", "Freight", "Charges"
· Lorry Receipt: "Document", "Parties", "Vehicle", "Goods", "Charges"
· POD: "Document", "Reference", "Delivery", "Condition", "Verification"

Be thorough — extract every visible field.`;

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:mime;base64,XXXXX" — strip the prefix
      const b64 = reader.result.split(",")[1];
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function extractDocumentBrowser(file, apiKey) {
  const isPDF = file.type === "application/pdf";
  const base64 = await fileToBase64(file);

  const contentBlock = isPDF
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
    : { type: "image",    source: { type: "base64", media_type: file.type,            data: base64 } };

  const headers = {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true",
    "content-type": "application/json",
  };
  if (isPDF) headers["anthropic-beta"] = "pdfs-2024-09-25";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      system: EXTRACTION_PROMPT_BROWSER,
      messages: [{ role: "user", content: [contentBlock] }],
      output_config: {
        format: {
          type: "json_schema",
          json_schema: { name: "freight_document_extraction", schema: EXTRACTION_SCHEMA_BROWSER },
        },
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const textBlock = data.content.find(b => b.type === "text");
  if (!textBlock) throw new Error("No text block in Claude response");
  return JSON.parse(textBlock.text);
}

async function extractBatchBrowser(files, apiKey) {
  const now = Date.now();
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const extracted = await extractDocumentBrowser(file, apiKey);
      const ts = new Date().toLocaleString("en-IN", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
      }).replace(",", "");

      results.push({
        id:        `DOC-${String(now + i).slice(-6)}`,
        filename:  file.name,
        type:      extracted.doc_type,
        typeLabel: extracted.type_label,
        pages:     1,
        sizeKb:    Math.round(file.size / 1024),
        uploaded:  ts,
        status:    "pending",
        fields:    extracted.field_groups,
      });
    } catch (err) {
      console.error(`Failed to extract ${file.name}:`, err.message);
      results.push({
        id:        `DOC-${String(now + i).slice(-6)}`,
        filename:  file.name,
        type:      "invoice",
        typeLabel: "Invoice",
        pages:     1,
        sizeKb:    Math.round(file.size / 1024),
        uploaded:  new Date().toLocaleString("en-IN", {
          year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit",
        }).replace(",", ""),
        status:    "error",
        fields:    [],
      });
    }
  }
  return results;
}

async function checkServerAvailable() {
  try {
    const res = await fetch("/api/health", { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

const API_KEY_STORAGE = "xtract_api_key";
function getStoredApiKey()        { return localStorage.getItem(API_KEY_STORAGE); }
function saveApiKey(key)          { localStorage.setItem(API_KEY_STORAGE, key); }
function clearApiKey()            { localStorage.removeItem(API_KEY_STORAGE); }

Object.assign(window, {
  extractBatchBrowser,
  checkServerAvailable,
  getStoredApiKey, saveApiKey, clearApiKey,
});
