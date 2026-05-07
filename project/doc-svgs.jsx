// SVG document mockups — coords match data.jsx bbox values (in %)
// Each returns an SVG string sized 800x1100 (an A4-ish ratio)

function docPaper(inner, opts = {}) {
  const tint = opts.tint || "#fdfcf8";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100">
    <defs>
      <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0.92  0 0 0 0 0.90  0 0 0 0 0.85  0 0 0 0.06 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
    </defs>
    <rect width="800" height="1100" fill="${tint}"/>
    <rect width="800" height="1100" fill="#000" filter="url(#paper)" opacity="0.4"/>
    ${inner}
  </svg>`;
}

const INVOICE_SVG = docPaper(`
  <!-- Header band -->
  <rect x="32" y="32" width="736" height="60" fill="#1a2332" opacity="0.04"/>
  <text x="48" y="62" font-family="Georgia, serif" font-size="22" font-weight="700" fill="#1a2332">MERIDIAN LOGISTICS</text>
  <text x="48" y="80" font-family="Georgia, serif" font-size="10" fill="#5a6472">Pvt Ltd · GSTIN 29ABCDE1234F1Z5 · CIN L63090KA2008PTC045621</text>

  <!-- Title -->
  <text x="304" y="68" font-family="Georgia, serif" font-size="20" font-weight="600" fill="#1a2332" letter-spacing="2">COMMERCIAL INVOICE</text>

  <!-- Right meta block -->
  <text x="496" y="135" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">Invoice No.</text>
  <text x="640" y="135" font-family="Helvetica, sans-serif" font-size="11" font-weight="600" fill="#111">INV-2026-04821</text>
  <text x="496" y="178" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">Invoice Date</text>
  <text x="640" y="178" font-family="Helvetica, sans-serif" font-size="11" font-weight="600" fill="#111">29 Apr 2026</text>
  <text x="496" y="222" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">PO Number</text>
  <text x="640" y="222" font-family="Helvetica, sans-serif" font-size="11" font-weight="600" fill="#111">PO-77321-A</text>

  <!-- Parties -->
  <text x="32" y="248" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">SHIPPER / BILL FROM</text>
  <text x="32" y="268" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111">Meridian Logistics Pvt Ltd</text>
  <text x="32" y="284" font-family="Helvetica, sans-serif" font-size="10" fill="#444">114 Industrial Layout, Whitefield</text>
  <text x="32" y="298" font-family="Helvetica, sans-serif" font-size="10" fill="#444">Bengaluru — 560066</text>
  <text x="32" y="318" font-family="Helvetica, sans-serif" font-size="10" font-weight="600" fill="#111">GSTIN: 29ABCDE1234F1Z5</text>

  <text x="32" y="370" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">CONSIGNEE / BILL TO</text>
  <text x="32" y="390" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111">Harbor Freight Co.</text>
  <text x="32" y="406" font-family="Helvetica, sans-serif" font-size="10" fill="#444">Plot 14, MIDC Andheri</text>
  <text x="32" y="420" font-family="Helvetica, sans-serif" font-size="10" fill="#444">Mumbai — 400093</text>
  <!-- consignee gstin smudged -->
  <text x="32" y="440" font-family="Helvetica, sans-serif" font-size="10" font-weight="600" fill="#111" opacity="0.5">GSTIN: 27XYZAB5678C2D3</text>
  <rect x="100" y="432" width="40" height="10" fill="#1a2332" opacity="0.18"/>

  <!-- Freight row -->
  <text x="32" y="490" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">ORIGIN</text>
  <text x="32" y="510" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111">Bengaluru, KA</text>
  <text x="224" y="490" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">DESTINATION</text>
  <text x="224" y="510" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111">Mumbai, MH</text>

  <text x="32" y="556" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">WEIGHT</text>
  <text x="32" y="574" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111">2,450 kg</text>
  <text x="160" y="556" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">VEHICLE</text>
  <text x="160" y="574" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111" opacity="0.45">KA-05-MN-7421</text>
  <rect x="160" y="565" width="160" height="14" fill="#000" opacity="0.05"/>

  <!-- Line items -->
  <line x1="32" y1="610" x2="768" y2="610" stroke="#d1d5db"/>
  <text x="32" y="630" font-family="Helvetica, sans-serif" font-size="10" font-weight="700" fill="#1a2332">DESCRIPTION</text>
  <text x="496" y="630" font-family="Helvetica, sans-serif" font-size="10" font-weight="700" fill="#1a2332">AMOUNT</text>
  <line x1="32" y1="638" x2="768" y2="638" stroke="#d1d5db"/>

  <text x="32" y="660" font-family="Helvetica, sans-serif" font-size="11" fill="#222">Freight: BLR → BOM, 2,450 kg @ ₹19.67/kg</text>
  <text x="640" y="660" font-family="Helvetica, sans-serif" font-size="11" fill="#222">₹ 48,200.00</text>

  <text x="32" y="708" font-family="Helvetica, sans-serif" font-size="11" fill="#222">Loading &amp; handling charges</text>
  <text x="640" y="708" font-family="Helvetica, sans-serif" font-size="11" fill="#222">₹ 1,500.00</text>

  <text x="32" y="752" font-family="Helvetica, sans-serif" font-size="11" fill="#222">Detention charges (waived)</text>
  <text x="640" y="752" font-family="Helvetica, sans-serif" font-size="11" fill="#222">₹ 0.00</text>

  <line x1="496" y1="790" x2="768" y2="790" stroke="#d1d5db"/>

  <text x="496" y="810" font-family="Helvetica, sans-serif" font-size="11" fill="#444">Subtotal</text>
  <text x="640" y="810" font-family="Helvetica, sans-serif" font-size="11" fill="#222">₹ 49,700.00</text>

  <text x="496" y="816" font-family="Helvetica, sans-serif" font-size="11" fill="#444">GST @ 18%</text>
  <text x="640" y="816" font-family="Helvetica, sans-serif" font-size="11" fill="#222">₹ 8,946.00</text>

  <line x1="496" y1="845" x2="768" y2="845" stroke="#1a2332" stroke-width="1.5"/>
  <text x="496" y="880" font-family="Helvetica, sans-serif" font-size="13" font-weight="700" fill="#111">TOTAL</text>
  <text x="640" y="880" font-family="Helvetica, sans-serif" font-size="14" font-weight="700" fill="#111">₹ 58,646.00</text>

  <!-- footer -->
  <text x="32" y="1050" font-family="Helvetica, sans-serif" font-size="9" fill="#888">This is a computer-generated invoice. Bank: HDFC · A/c 50200012345678 · IFSC HDFC0001234</text>
`);

const LORRY_SVG = docPaper(`
  <rect x="32" y="32" width="736" height="48" fill="#1a2332" opacity="0.04"/>
  <text x="48" y="60" font-family="Georgia, serif" font-size="18" font-weight="700" fill="#1a2332">MERIDIAN LOGISTICS</text>
  <text x="288" y="62" font-family="Georgia, serif" font-size="18" font-weight="600" fill="#1a2332" letter-spacing="2">LORRY RECEIPT</text>

  <!-- Right meta -->
  <text x="496" y="135" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">LR Number</text>
  <text x="640" y="135" font-family="Helvetica, sans-serif" font-size="11" font-weight="600" fill="#111">MLP/BLR/26/11240</text>
  <text x="496" y="178" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">LR Date</text>
  <text x="640" y="178" font-family="Helvetica, sans-serif" font-size="11" font-weight="600" fill="#111">29 Apr 2026</text>

  <!-- Parties grid -->
  <line x1="32" y1="240" x2="768" y2="240" stroke="#d1d5db"/>
  <text x="32" y="234" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">CONSIGNOR</text>
  <text x="32" y="262" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111">Meridian Logistics</text>
  <text x="32" y="278" font-family="Helvetica, sans-serif" font-size="10" fill="#444">Whitefield, Bengaluru</text>

  <text x="352" y="234" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">FROM</text>
  <text x="352" y="262" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111">Bengaluru</text>

  <line x1="32" y1="312" x2="768" y2="312" stroke="#d1d5db"/>
  <text x="32" y="306" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">CONSIGNEE</text>
  <text x="32" y="332" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111">Harbor Freight Co.</text>
  <text x="32" y="348" font-family="Helvetica, sans-serif" font-size="10" fill="#444">Andheri MIDC, Mumbai</text>

  <text x="352" y="306" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">TO</text>
  <text x="352" y="332" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111">Mumbai</text>

  <!-- Vehicle row -->
  <line x1="32" y1="386" x2="768" y2="386" stroke="#d1d5db"/>
  <text x="32" y="380" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">VEHICLE NO.</text>
  <text x="32" y="406" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111">KA-05-MN-7421</text>

  <text x="224" y="380" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">DRIVER NAME</text>
  <text x="224" y="406" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111" opacity="0.7">Suresh Kumar</text>
  <rect x="224" y="396" width="120" height="14" fill="#000" opacity="0.04"/>

  <text x="416" y="380" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">DRIVER LICENSE</text>
  <text x="416" y="406" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111" opacity="0.4">KA0220180034521</text>
  <rect x="416" y="396" width="180" height="14" fill="#000" opacity="0.1"/>
  <!-- ink smudge over license -->
  <ellipse cx="490" cy="403" rx="55" ry="6" fill="#1a2332" opacity="0.15"/>

  <!-- Goods grid header -->
  <line x1="32" y1="486" x2="768" y2="486" stroke="#1a2332" stroke-width="1.2"/>
  <text x="32" y="478" font-family="Helvetica, sans-serif" font-size="10" font-weight="700" fill="#1a2332">PKGS</text>
  <text x="144" y="478" font-family="Helvetica, sans-serif" font-size="10" font-weight="700" fill="#1a2332">DESCRIPTION OF GOODS</text>
  <text x="32" y="510" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111">42</text>
  <text x="144" y="510" font-family="Helvetica, sans-serif" font-size="13" fill="#111">Industrial spare parts</text>

  <text x="32" y="556" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">ACTUAL WEIGHT</text>
  <text x="32" y="574" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111">2,450 kg</text>
  <text x="224" y="556" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">CHARGED WEIGHT</text>
  <text x="224" y="574" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111" opacity="0.55">2,500 kg</text>
  <rect x="224" y="565" width="100" height="14" fill="#000" opacity="0.06"/>

  <!-- Charges -->
  <line x1="32" y1="640" x2="768" y2="640" stroke="#d1d5db"/>
  <text x="496" y="780" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">Freight Amount</text>
  <text x="640" y="780" font-family="Helvetica, sans-serif" font-size="11" font-weight="600" fill="#111">₹ 48,200.00</text>
  <text x="496" y="824" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">Advance Paid</text>
  <text x="640" y="824" font-family="Helvetica, sans-serif" font-size="11" font-weight="600" fill="#111">₹ 15,000.00</text>
  <line x1="496" y1="850" x2="768" y2="850" stroke="#1a2332" stroke-width="1.2"/>
  <text x="496" y="868" font-family="Helvetica, sans-serif" font-size="10" font-weight="700" fill="#1a2332">BALANCE DUE</text>
  <text x="640" y="868" font-family="Helvetica, sans-serif" font-size="13" font-weight="700" fill="#111">₹ 33,200.00</text>

  <!-- terms -->
  <text x="32" y="940" font-family="Helvetica, sans-serif" font-size="9" fill="#888">Goods accepted at owner's risk. Subject to Bengaluru jurisdiction.</text>
  <text x="32" y="970" font-family="Helvetica, sans-serif" font-size="9" fill="#888">Consignor's signature ___________________     Driver's signature ___________________</text>
`);

const POD_SVG = docPaper(`
  <rect x="32" y="32" width="736" height="48" fill="#1a2332" opacity="0.04"/>
  <text x="48" y="60" font-family="Georgia, serif" font-size="16" font-weight="700" fill="#1a2332">HARBOR FREIGHT CO.</text>
  <text x="272" y="62" font-family="Georgia, serif" font-size="18" font-weight="600" fill="#1a2332" letter-spacing="2">PROOF OF DELIVERY</text>

  <text x="496" y="135" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">POD Number</text>
  <text x="640" y="135" font-family="Helvetica, sans-serif" font-size="11" font-weight="600" fill="#111">POD-26-04821</text>
  <text x="496" y="178" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">Delivery Date</text>
  <text x="640" y="178" font-family="Helvetica, sans-serif" font-size="11" font-weight="600" fill="#111">02 May 2026</text>
  <text x="496" y="222" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">Delivery Time</text>
  <text x="640" y="222" font-family="Helvetica, sans-serif" font-size="11" font-weight="600" fill="#111" opacity="0.7">14:32</text>
  <rect x="640" y="212" width="60" height="14" fill="#000" opacity="0.04"/>

  <!-- References -->
  <text x="32" y="248" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">LR REFERENCE</text>
  <text x="32" y="266" font-family="Helvetica, sans-serif" font-size="12" font-weight="600" fill="#111">MLP/BLR/26/11240</text>
  <text x="32" y="294" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">INVOICE REFERENCE</text>
  <text x="32" y="312" font-family="Helvetica, sans-serif" font-size="12" font-weight="600" fill="#111">INV-2026-04821</text>

  <line x1="32" y1="354" x2="768" y2="354" stroke="#d1d5db"/>

  <!-- Delivery -->
  <text x="32" y="382" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">DELIVERED TO</text>
  <text x="32" y="402" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111">Harbor Freight Co.</text>

  <text x="32" y="448" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">RECEIVED BY</text>
  <text x="32" y="466" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111" opacity="0.55">R. Mehta</text>
  <rect x="32" y="455" width="100" height="14" fill="#000" opacity="0.05"/>

  <text x="224" y="448" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">DESIGNATION</text>
  <text x="224" y="466" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111" opacity="0.45">Stores Manager</text>
  <rect x="224" y="455" width="140" height="14" fill="#000" opacity="0.07"/>

  <text x="32" y="514" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">DELIVERY ADDRESS</text>
  <text x="32" y="534" font-family="Helvetica, sans-serif" font-size="12" fill="#111" opacity="0.78">Plot 14, MIDC Andheri, Mumbai 400093</text>

  <!-- Condition -->
  <line x1="32" y1="600" x2="768" y2="600" stroke="#d1d5db"/>
  <text x="32" y="624" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">PACKAGES RECEIVED</text>
  <text x="32" y="642" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111">42</text>
  <text x="192" y="624" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">DAMAGED</text>
  <text x="192" y="642" font-family="Helvetica, sans-serif" font-size="13" font-weight="600" fill="#111" opacity="0.7">1</text>

  <text x="32" y="690" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">REMARKS</text>
  <text x="32" y="710" font-family="Helvetica, sans-serif" font-size="11" fill="#111" opacity="0.45" font-style="italic">"1 carton w/ minor dents, contents OK"</text>
  <rect x="32" y="700" width="380" height="16" fill="#000" opacity="0.04"/>
  <!-- handwritten scribble emulation -->
  <path d="M40 712 Q60 706 80 712 T120 710 T160 712 T220 708 T280 712 T340 710" stroke="#1a3a8f" stroke-width="1.2" fill="none" opacity="0.5"/>

  <!-- Verification -->
  <text x="496" y="690" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">SIGNATURE PRESENT</text>
  <text x="640" y="690" font-family="Helvetica, sans-serif" font-size="12" font-weight="600" fill="#111">Yes</text>
  <text x="496" y="734" font-family="Helvetica, sans-serif" font-size="10" fill="#6b7280">COMPANY STAMP</text>
  <text x="640" y="734" font-family="Helvetica, sans-serif" font-size="12" font-weight="600" fill="#111">Yes</text>

  <!-- signature & stamp visuals -->
  <g transform="translate(496 800)">
    <text x="0" y="0" font-family="Helvetica, sans-serif" font-size="9" fill="#888">Receiver's signature &amp; stamp</text>
    <path d="M0 30 Q15 10 30 28 T70 26 T120 30 T180 28" stroke="#1a3a8f" stroke-width="2" fill="none"/>
    <circle cx="160" cy="60" r="38" fill="none" stroke="#a1242e" stroke-width="2" opacity="0.55"/>
    <circle cx="160" cy="60" r="32" fill="none" stroke="#a1242e" stroke-width="1" opacity="0.55"/>
    <text x="160" y="56" text-anchor="middle" font-family="Helvetica, sans-serif" font-size="8" font-weight="700" fill="#a1242e" opacity="0.6">HARBOR FREIGHT</text>
    <text x="160" y="68" text-anchor="middle" font-family="Helvetica, sans-serif" font-size="7" fill="#a1242e" opacity="0.6">MUMBAI · 400093</text>
  </g>
`);

const DOC_SVGS = {
  "DOC-001": INVOICE_SVG,
  "DOC-002": LORRY_SVG,
  "DOC-003": POD_SVG,
  "DOC-004": INVOICE_SVG,
  "DOC-005": LORRY_SVG,
  "DOC-006": POD_SVG,
  "DOC-007": INVOICE_SVG,
};

function svgDataUri(svg) {
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

Object.assign(window, { DOC_SVGS, svgDataUri, INVOICE_SVG, LORRY_SVG, POD_SVG });
