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

  // ---- Sheet 1: Summary ----
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
    { wch: 12 }, { wch: 32 }, { wch: 18 }, { wch: 22 },
    { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  // ---- Sheet 2: Field Details (only rows that have saved field values) ----
  const withFields = history.filter(r => r.fieldValues && Object.keys(r.fieldValues).length > 0);
  if (withFields.length > 0) {
    // Gather all unique field keys preserving first-seen order
    const seen = new Set();
    const allKeys = [];
    withFields.forEach(r => {
      Object.keys(r.fieldValues).forEach(k => {
        if (!seen.has(k)) { seen.add(k); allKeys.push(k); }
      });
    });

    const detailRows = withFields.map(r => {
      const row = {
        "Doc ID":   r.id,
        "Filename": r.filename,
        "Type":     r.typeLabel,
        "Saved At": r.saved,
        "Status":   r.status,
      };
      allKeys.forEach(k => { row[k] = r.fieldValues[k] ?? ""; });
      return row;
    });

    const detailWs = XLSX.utils.json_to_sheet(detailRows);
    // Auto-width for first fixed columns + 14 for field columns
    detailWs["!cols"] = [
      { wch: 12 }, { wch: 32 }, { wch: 18 }, { wch: 22 }, { wch: 14 },
      ...allKeys.map(() => ({ wch: 22 })),
    ];
    XLSX.utils.book_append_sheet(wb, detailWs, "Field Details");
  }

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `xtract-export-${date}.xlsx`);
}

Object.assign(window, { loadStoredHistory, saveStoredHistory, exportToExcel });
