// Sample freight documents with realistic extracted fields + bbox coords
// bbox = [x%, y%, w%, h%] relative to document image
// confidence: 0..1

const FIELD_GROUPS = {
  invoice: [
    { group: "Document", fields: [
      { key: "doc_type", label: "Document Type", value: "Commercial Invoice", confidence: 0.99, bbox: [38, 4, 24, 4] },
      { key: "invoice_no", label: "Invoice No.", value: "INV-2026-04821", confidence: 0.98, bbox: [62, 11, 22, 3] },
      { key: "invoice_date", label: "Invoice Date", value: "2026-04-29", confidence: 0.97, bbox: [62, 15, 22, 3] },
      { key: "po_number", label: "PO Number", value: "PO-77321-A", confidence: 0.93, bbox: [62, 19, 22, 3] },
    ]},
    { group: "Parties", fields: [
      { key: "shipper", label: "Shipper", value: "Meridian Logistics Pvt Ltd", confidence: 0.96, bbox: [4, 22, 38, 4] },
      { key: "shipper_gstin", label: "Shipper GSTIN", value: "29ABCDE1234F1Z5", confidence: 0.91, bbox: [4, 27, 38, 3] },
      { key: "consignee", label: "Consignee", value: "Harbor Freight Co.", confidence: 0.95, bbox: [4, 33, 38, 4] },
      { key: "consignee_gstin", label: "Consignee GSTIN", value: "27XYZAB5678C2D3", confidence: 0.62, bbox: [4, 38, 38, 3] },
    ]},
    { group: "Freight", fields: [
      { key: "origin", label: "Origin", value: "Bengaluru, KA", confidence: 0.94, bbox: [4, 44, 22, 3] },
      { key: "destination", label: "Destination", value: "Mumbai, MH", confidence: 0.97, bbox: [28, 44, 22, 3] },
      { key: "weight_kg", label: "Weight (kg)", value: "2,450", confidence: 0.89, bbox: [4, 50, 14, 3] },
      { key: "vehicle_no", label: "Vehicle No.", value: "KA-05-MN-7421", confidence: 0.55, bbox: [20, 50, 22, 3] },
    ]},
    { group: "Charges", fields: [
      { key: "freight_charges", label: "Freight Charges", value: "₹ 48,200.00", confidence: 0.98, bbox: [62, 60, 22, 3] },
      { key: "loading_charges", label: "Loading Charges", value: "₹ 1,500.00", confidence: 0.96, bbox: [62, 64, 22, 3] },
      { key: "detention", label: "Detention", value: "₹ 0.00", confidence: 0.84, bbox: [62, 68, 22, 3] },
      { key: "gst_18", label: "GST @ 18%", value: "₹ 8,946.00", confidence: 0.97, bbox: [62, 73, 22, 3] },
      { key: "total", label: "Total Amount", value: "₹ 58,646.00", confidence: 0.99, bbox: [62, 79, 22, 4] },
    ]},
  ],
  lorry: [
    { group: "Document", fields: [
      { key: "doc_type", label: "Document Type", value: "Lorry Receipt", confidence: 0.99, bbox: [36, 4, 28, 4] },
      { key: "lr_number", label: "LR Number", value: "MLP/BLR/26/11240", confidence: 0.98, bbox: [62, 11, 24, 3] },
      { key: "lr_date", label: "LR Date", value: "2026-04-29", confidence: 0.96, bbox: [62, 15, 24, 3] },
    ]},
    { group: "Parties", fields: [
      { key: "consignor", label: "Consignor", value: "Meridian Logistics", confidence: 0.94, bbox: [4, 21, 38, 4] },
      { key: "consignee", label: "Consignee", value: "Harbor Freight Co.", confidence: 0.93, bbox: [4, 27, 38, 4] },
      { key: "from_location", label: "From", value: "Bengaluru", confidence: 0.97, bbox: [44, 21, 18, 3] },
      { key: "to_location", label: "To", value: "Mumbai", confidence: 0.97, bbox: [44, 27, 18, 3] },
    ]},
    { group: "Vehicle", fields: [
      { key: "vehicle_no", label: "Vehicle No.", value: "KA-05-MN-7421", confidence: 0.88, bbox: [4, 36, 22, 3] },
      { key: "driver_name", label: "Driver Name", value: "Suresh Kumar", confidence: 0.71, bbox: [28, 36, 22, 3] },
      { key: "driver_license", label: "Driver License", value: "KA0220180034521", confidence: 0.48, bbox: [52, 36, 24, 3] },
    ]},
    { group: "Goods", fields: [
      { key: "packages", label: "Packages", value: "42", confidence: 0.96, bbox: [4, 46, 12, 3] },
      { key: "description", label: "Description", value: "Industrial spare parts", confidence: 0.84, bbox: [18, 46, 36, 3] },
      { key: "actual_weight", label: "Actual Weight (kg)", value: "2,450", confidence: 0.92, bbox: [4, 51, 22, 3] },
      { key: "charged_weight", label: "Charged Weight (kg)", value: "2,500", confidence: 0.59, bbox: [28, 51, 22, 3] },
    ]},
    { group: "Charges", fields: [
      { key: "freight_amount", label: "Freight Amount", value: "₹ 48,200.00", confidence: 0.97, bbox: [62, 70, 24, 3] },
      { key: "advance_paid", label: "Advance Paid", value: "₹ 15,000.00", confidence: 0.93, bbox: [62, 74, 24, 3] },
      { key: "balance", label: "Balance Due", value: "₹ 33,200.00", confidence: 0.95, bbox: [62, 78, 24, 3] },
    ]},
  ],
  pod: [
    { group: "Document", fields: [
      { key: "doc_type", label: "Document Type", value: "Proof of Delivery", confidence: 0.99, bbox: [34, 4, 32, 4] },
      { key: "pod_number", label: "POD Number", value: "POD-26-04821", confidence: 0.97, bbox: [62, 11, 22, 3] },
      { key: "delivery_date", label: "Delivery Date", value: "2026-05-02", confidence: 0.96, bbox: [62, 15, 22, 3] },
      { key: "delivery_time", label: "Delivery Time", value: "14:32", confidence: 0.78, bbox: [62, 19, 22, 3] },
    ]},
    { group: "Reference", fields: [
      { key: "lr_number", label: "LR Reference", value: "MLP/BLR/26/11240", confidence: 0.94, bbox: [4, 22, 38, 3] },
      { key: "invoice_no", label: "Invoice Reference", value: "INV-2026-04821", confidence: 0.92, bbox: [4, 26, 38, 3] },
    ]},
    { group: "Delivery", fields: [
      { key: "delivered_to", label: "Delivered To", value: "Harbor Freight Co.", confidence: 0.91, bbox: [4, 34, 38, 4] },
      { key: "received_by", label: "Received By", value: "R. Mehta", confidence: 0.66, bbox: [4, 40, 22, 3] },
      { key: "designation", label: "Designation", value: "Stores Manager", confidence: 0.52, bbox: [28, 40, 22, 3] },
      { key: "address", label: "Delivery Address", value: "Plot 14, MIDC Andheri, Mumbai 400093", confidence: 0.81, bbox: [4, 46, 50, 4] },
    ]},
    { group: "Condition", fields: [
      { key: "packages_received", label: "Packages Received", value: "42", confidence: 0.96, bbox: [4, 56, 18, 3] },
      { key: "packages_damaged", label: "Damaged", value: "1", confidence: 0.74, bbox: [24, 56, 14, 3] },
      { key: "remarks", label: "Remarks", value: "1 carton with minor dents, contents verified OK", confidence: 0.46, bbox: [4, 62, 60, 4] },
    ]},
    { group: "Verification", fields: [
      { key: "signature_present", label: "Signature Present", value: "Yes", confidence: 0.88, bbox: [62, 62, 22, 3] },
      { key: "stamp_present", label: "Company Stamp", value: "Yes", confidence: 0.85, bbox: [62, 66, 22, 3] },
    ]},
  ],
};

const DOCUMENTS = [
  {
    id: "DOC-001",
    filename: "INV-2026-04821.pdf",
    type: "invoice",
    typeLabel: "Invoice",
    pages: 1,
    sizeKb: 284,
    uploaded: "2026-05-07 09:14",
    status: "pending",
    fields: FIELD_GROUPS.invoice,
  },
  {
    id: "DOC-002",
    filename: "LR_MLP-BLR-11240.pdf",
    type: "lorry",
    typeLabel: "Lorry Receipt",
    pages: 1,
    sizeKb: 198,
    uploaded: "2026-05-07 09:14",
    status: "pending",
    fields: FIELD_GROUPS.lorry,
  },
  {
    id: "DOC-003",
    filename: "POD_HFC_05021432.jpg",
    type: "pod",
    typeLabel: "Proof of Delivery",
    pages: 1,
    sizeKb: 612,
    uploaded: "2026-05-07 09:14",
    status: "pending",
    fields: FIELD_GROUPS.pod,
  },
  {
    id: "DOC-004",
    filename: "INV-2026-04822.pdf",
    type: "invoice",
    typeLabel: "Invoice",
    pages: 1,
    sizeKb: 271,
    uploaded: "2026-05-07 09:14",
    status: "pending",
    fields: FIELD_GROUPS.invoice,
  },
  {
    id: "DOC-005",
    filename: "LR_MLP-BLR-11241.pdf",
    type: "lorry",
    typeLabel: "Lorry Receipt",
    pages: 1,
    sizeKb: 204,
    uploaded: "2026-05-07 09:14",
    status: "pending",
    fields: FIELD_GROUPS.lorry,
  },
  {
    id: "DOC-006",
    filename: "POD_HFC_05031108.jpg",
    type: "pod",
    typeLabel: "Proof of Delivery",
    pages: 1,
    sizeKb: 588,
    uploaded: "2026-05-07 09:14",
    status: "pending",
    fields: FIELD_GROUPS.pod,
  },
  {
    id: "DOC-007",
    filename: "INV-2026-04823.pdf",
    type: "invoice",
    typeLabel: "Invoice",
    pages: 1,
    sizeKb: 295,
    uploaded: "2026-05-07 09:14",
    status: "pending",
    fields: FIELD_GROUPS.invoice,
  },
];

// Already-saved history rows
const HISTORY = [
  { id: "DOC-A91", filename: "INV-2026-04812.pdf", typeLabel: "Invoice", saved: "2026-05-07 08:42", auditor: "You", flagged: 0, total: "₹ 62,180.00", status: "Verified" },
  { id: "DOC-A90", filename: "LR_MLP-BLR-11238.pdf", typeLabel: "Lorry Receipt", saved: "2026-05-07 08:39", auditor: "You", flagged: 1, total: "₹ 41,500.00", status: "Verified" },
  { id: "DOC-A89", filename: "POD_HFC_05011602.jpg", typeLabel: "Proof of Delivery", saved: "2026-05-07 08:35", auditor: "You", flagged: 2, total: "—", status: "Verified" },
  { id: "DOC-A88", filename: "INV-2026-04811.pdf", typeLabel: "Invoice", saved: "2026-05-07 08:31", auditor: "You", flagged: 0, total: "₹ 28,950.00", status: "Verified" },
  { id: "DOC-A87", filename: "INV-2026-04810.pdf", typeLabel: "Invoice", saved: "2026-05-07 08:24", auditor: "You", flagged: 0, total: "₹ 91,440.00", status: "Verified" },
  { id: "DOC-A86", filename: "LR_MLP-BLR-11237.pdf", typeLabel: "Lorry Receipt", saved: "2026-05-07 08:18", auditor: "You", flagged: 1, total: "₹ 33,200.00", status: "Verified" },
  { id: "DOC-A85", filename: "POD_HFC_04301407.jpg", typeLabel: "Proof of Delivery", saved: "2026-05-07 08:12", auditor: "You", flagged: 0, total: "—", status: "Verified" },
  { id: "DOC-A84", filename: "INV-2026-04809.pdf", typeLabel: "Invoice", saved: "2026-05-07 08:05", auditor: "You", flagged: 3, total: "₹ 14,720.00", status: "Needs review" },
  { id: "DOC-A83", filename: "INV-2026-04808.pdf", typeLabel: "Invoice", saved: "2026-05-07 07:58", auditor: "You", flagged: 0, total: "₹ 57,300.00", status: "Verified" },
  { id: "DOC-A82", filename: "LR_MLP-BLR-11236.pdf", typeLabel: "Lorry Receipt", saved: "2026-05-07 07:52", auditor: "You", flagged: 0, total: "₹ 22,100.00", status: "Verified" },
];

Object.assign(window, { DOCUMENTS, HISTORY, FIELD_GROUPS });
