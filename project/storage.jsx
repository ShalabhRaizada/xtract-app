// xTract — localStorage persistence + Excel export

const STORAGE_KEY = "xtract_history_v1";

function loadStoredHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function saveStoredHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (_) {
    // quota exceeded — silently continue
  }
}

function exportToExcel(history) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Summary ──────────────────────────────────────────────────────
  const summaryRows = history.map(r => ({
    "Doc ID":         r.id,
    "Filename":       r.filename,
    "Type":           r.typeLabel,
    "Saved At":       r.saved,
    "Auditor":        r.auditor,
    "Flagged Fields": r.flagged,
    "Total Amount":   r.total,
    "Status":         r.status,
  }));
  const summaryWs = XLSX.utils.json_to_sheet(summaryRows);
  summaryWs["!cols"] = [
    { wch: 12 }, { wch: 36 }, { wch: 18 }, { wch: 22 },
    { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 14 },
  ];
  styleHeader(summaryWs, summaryRows.length);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  // ── Sheets 2-4: One per document type ────────────────────────────────────
  const docTypes = [
    { key: "invoice", label: "Invoices" },
    { key: "lorry",   label: "Lorry Receipts" },
    { key: "pod",     label: "POD" },
  ];

  docTypes.forEach(({ key, label }) => {
    const rows = history.filter(
      r => r.fieldValues && Object.keys(r.fieldValues).length > 0 &&
           (r.type === key || (!r.type && r.typeLabel && r.typeLabel.toLowerCase().includes(
             key === "invoice" ? "invoice" : key === "lorry" ? "lorry" : "delivery"
           )))
    );
    if (rows.length === 0) return;

    // Collect all field keys in first-seen order, using human-readable labels as headers
    const keyOrder = [];
    const keyToLabel = {};
    const keyToGroup = {};
    rows.forEach(r => {
      Object.keys(r.fieldValues || {}).forEach(k => {
        if (!keyToLabel[k]) {
          keyOrder.push(k);
          keyToLabel[k] = (r.fieldLabels && r.fieldLabels[k]) || toTitleCase(k);
          keyToGroup[k] = (r.fieldGroups && r.fieldGroups[k]) || "";
        }
      });
    });

    const detailRows = rows.map(r => {
      const row = {
        "Doc ID":   r.id,
        "Filename": r.filename,
        "Saved At": r.saved,
        "Status":   r.status,
      };
      keyOrder.forEach(k => {
        const header = keyToGroup[k] ? `${keyToGroup[k]} — ${keyToLabel[k]}` : keyToLabel[k];
        row[header] = r.fieldValues[k] ?? "";
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(detailRows);
    const fixedCols = [{ wch: 12 }, { wch: 36 }, { wch: 22 }, { wch: 14 }];
    ws["!cols"] = [...fixedCols, ...keyOrder.map(() => ({ wch: 26 }))];
    styleHeader(ws, detailRows.length);
    XLSX.utils.book_append_sheet(wb, ws, label);
  });

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `xtract-export-${date}.xlsx`);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toTitleCase(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function styleHeader(ws, rowCount) {
  // Bold the header row (row 0)
  if (!ws["!ref"]) return;
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[addr]) continue;
    ws[addr].s = { font: { bold: true }, fill: { fgColor: { rgb: "EEF2FF" } } };
  }
}

Object.assign(window, { loadStoredHistory, saveStoredHistory, exportToExcel });
