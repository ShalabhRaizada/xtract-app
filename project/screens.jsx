// Screens for xTract — empty, upload, processing, review, save, queue, history
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------------- Sidebar (left nav) ----------------
function Sidebar({ active, onNavigate, queueCount, processedToday }) {
  const items = [
    { id: "queue", label: "Queue", icon: I.doc, badge: queueCount },
    { id: "review", label: "Review", icon: I.spark },
    { id: "history", label: "History", icon: I.save },
  ];
  return (
    <aside className="x-sidebar">
      <div className="x-sidebar__brand">
        <div className="x-logo">
          <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 4l7 8-7 8h4l5-6 5 6h4l-7-8 7-8h-4l-5 6-5-6z" fill="currentColor"/></svg>
        </div>
        <div>
          <div className="x-sidebar__name">xTract</div>
          <div className="x-sidebar__sub">Freight audit</div>
        </div>
      </div>
      <nav className="x-sidebar__nav">
        {items.map(it => (
          <button
            key={it.id}
            className={cx("x-navitem", active === it.id && "x-navitem--active")}
            onClick={() => onNavigate(it.id)}
          >
            <span className="x-navitem__ico">{it.icon}</span>
            <span>{it.label}</span>
            {it.badge != null && it.badge > 0 && <span className="x-navitem__badge">{it.badge}</span>}
          </button>
        ))}
      </nav>
      <div className="x-sidebar__stats">
        <div className="x-stat">
          <div className="x-stat__num">{processedToday}</div>
          <div className="x-stat__lbl">Processed today</div>
        </div>
        <div className="x-stat">
          <div className="x-stat__num">300</div>
          <div className="x-stat__lbl">Daily target</div>
        </div>
        <div className="x-progressbar">
          <div className="x-progressbar__fill" style={{ width: `${Math.min(100, (processedToday/300)*100)}%` }}/>
        </div>
      </div>
      <div className="x-sidebar__user">
        <Avatar name="Priya Nair"/>
        <div>
          <div className="x-sidebar__uname">Priya Nair</div>
          <div className="x-sidebar__urole">Freight Auditor</div>
        </div>
      </div>
    </aside>
  );
}

// ---------------- Topbar ----------------
function Topbar({ title, subtitle, right }) {
  return (
    <header className="x-topbar">
      <div>
        <div className="x-topbar__title">{title}</div>
        {subtitle && <div className="x-topbar__sub">{subtitle}</div>}
      </div>
      <div className="x-topbar__right">{right}</div>
    </header>
  );
}

// ---------------- Empty State ----------------
function EmptyState({ onUpload }) {
  return (
    <div className="x-empty">
      <div className="x-empty__inner">
        <div className="x-empty__visual">
          <svg viewBox="0 0 200 140" width="200" height="140">
            <rect x="34" y="22" width="80" height="100" rx="3" fill="#fff" stroke="var(--line)" strokeWidth="1.5"/>
            <rect x="40" y="32" width="60" height="3" fill="var(--line)"/>
            <rect x="40" y="40" width="50" height="3" fill="var(--line)"/>
            <rect x="40" y="48" width="58" height="3" fill="var(--line)"/>
            <rect x="40" y="60" width="35" height="3" fill="var(--line)"/>
            <rect x="40" y="68" width="55" height="3" fill="var(--line)"/>
            <rect x="64" y="42" width="100" height="100" rx="3" fill="#fff" stroke="var(--accent)" strokeWidth="1.5"/>
            <rect x="72" y="52" width="70" height="3" fill="var(--line)"/>
            <rect x="72" y="60" width="60" height="3" fill="var(--line)"/>
            <rect x="72" y="68" width="80" height="3" fill="var(--line)"/>
            <g stroke="var(--accent)" strokeWidth="1.2" fill="none">
              <path d="M150 80l3 3 6-6"/>
              <circle cx="155" cy="80" r="10"/>
            </g>
          </svg>
        </div>
        <h2 className="x-empty__h">No documents in your queue</h2>
        <p className="x-empty__p">Upload invoices, lorry receipts, or proof-of-delivery scans. xTract will extract fields automatically — you review and save.</p>
        <div className="x-empty__cta">
          <Btn variant="primary" size="lg" icon={I.upload} onClick={onUpload} kbd="U">Upload documents</Btn>
        </div>
        <div className="x-empty__hints">
          <div><DocTypeBadge type="invoice" label="Invoice"/></div>
          <div><DocTypeBadge type="lorry" label="Lorry Receipt"/></div>
          <div><DocTypeBadge type="pod" label="Proof of Delivery"/></div>
          <div className="x-empty__formats">PDF · JPG · PNG · TIFF · up to 25 MB</div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Upload (drag-drop) ----------------
function UploadScreen({ onUploaded, onCancel }) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);

  const fakeFiles = [
    { name: "INV-2026-04821.pdf", size: "284 KB", type: "invoice" },
    { name: "LR_MLP-BLR-11240.pdf", size: "198 KB", type: "lorry" },
    { name: "POD_HFC_05021432.jpg", size: "612 KB", type: "pod" },
    { name: "INV-2026-04822.pdf", size: "271 KB", type: "invoice" },
    { name: "LR_MLP-BLR-11241.pdf", size: "204 KB", type: "lorry" },
    { name: "POD_HFC_05031108.jpg", size: "588 KB", type: "pod" },
    { name: "INV-2026-04823.pdf", size: "295 KB", type: "invoice" },
  ];

  function simulateDrop() {
    setFiles(fakeFiles);
  }

  return (
    <div className="x-upload">
      <div
        className={cx("x-dropzone", dragging && "x-dropzone--drag", files.length && "x-dropzone--has")}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); simulateDrop(); }}
        onClick={() => !files.length && simulateDrop()}
      >
        {!files.length ? (
          <>
            <div className="x-dropzone__ico">{I.upload}</div>
            <div className="x-dropzone__title">Drop documents here</div>
            <div className="x-dropzone__sub">or click to browse · PDF, JPG, PNG, TIFF · multi-page OK</div>
            <div className="x-dropzone__chips">
              <span className="x-chip">Up to 25 MB / file</span>
              <span className="x-chip">Up to 100 files / batch</span>
              <span className="x-chip">Auto-detects type</span>
            </div>
          </>
        ) : (
          <div className="x-filelist">
            <div className="x-filelist__head">
              <strong>{files.length} files ready</strong>
              <span>Total {files.reduce((s, f) => s + parseInt(f.size), 0).toFixed(0)} KB</span>
            </div>
            <div className="x-filelist__rows">
              {files.map((f, i) => (
                <div key={i} className="x-filerow">
                  <DocTypeBadge type={f.type} label={f.type === "invoice" ? "Invoice" : f.type === "lorry" ? "Lorry Receipt" : "Proof of Delivery"}/>
                  <span className="x-filerow__name">{f.name}</span>
                  <span className="x-filerow__size">{f.size}</span>
                  <button className="x-filerow__x" onClick={e => { e.stopPropagation(); setFiles(files.filter((_, j) => j !== i)); }}>{I.trash}</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="x-upload__bar">
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn variant="primary" size="lg" icon={I.spark} disabled={!files.length} onClick={() => onUploaded(files)}>
          Start extraction · {files.length} {files.length === 1 ? "doc" : "docs"}
        </Btn>
      </div>
    </div>
  );
}

// ---------------- Processing ----------------
function ProcessingScreen({ count, onDone }) {
  const stages = [
    { id: "upload", label: "Uploading", duration: 800 },
    { id: "ocr", label: "Reading pages", duration: 1400 },
    { id: "extract", label: "Extracting fields", duration: 1800 },
    { id: "verify", label: "Cross-checking", duration: 900 },
  ];
  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [docIdx, setDocIdx] = useState(0);

  useEffect(() => {
    let raf, t0 = performance.now();
    let totalDuration = stages.reduce((s, x) => s + x.duration, 0);
    function tick(now) {
      const elapsed = now - t0;
      let acc = 0;
      let curStage = 0;
      for (let i = 0; i < stages.length; i++) {
        if (elapsed >= acc && elapsed < acc + stages[i].duration) {
          curStage = i; break;
        }
        acc += stages[i].duration;
        curStage = i;
      }
      setStageIdx(curStage);
      setProgress(Math.min(1, elapsed / totalDuration));
      setDocIdx(Math.min(count - 1, Math.floor((elapsed / totalDuration) * count)));
      if (elapsed < totalDuration) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 250);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="x-processing">
      <div className="x-processing__inner">
        <div className="x-processing__spark">{I.spark}</div>
        <h2 className="x-processing__h">Extracting fields from {count} documents</h2>
        <p className="x-processing__sub">Document {docIdx + 1} of {count}</p>

        <div className="x-stages">
          {stages.map((s, i) => (
            <div key={s.id} className={cx("x-stage", i < stageIdx && "x-stage--done", i === stageIdx && "x-stage--active")}>
              <div className="x-stage__num">{i < stageIdx ? <span className="x-stage__check">{I.check}</span> : i + 1}</div>
              <div className="x-stage__lbl">{s.label}</div>
              {i === stageIdx && <div className="x-stage__pulse"/>}
            </div>
          ))}
        </div>

        <div className="x-bigbar">
          <div className="x-bigbar__fill" style={{ width: `${Math.round(progress * 100)}%` }}/>
        </div>
        <div className="x-bigbar__meta">
          <span>{Math.round(progress * 100)}%</span>
          <span>~{Math.max(1, Math.ceil((1 - progress) * 5))}s remaining</span>
        </div>

        <div className="x-processing__log">
          <div className={cx("x-logline", stageIdx >= 0 && "x-logline--on")}>→ Validated 7 files · 2.34 MB total</div>
          <div className={cx("x-logline", stageIdx >= 1 && "x-logline--on")}>→ OCR complete · 7 pages · 4,128 tokens</div>
          <div className={cx("x-logline", stageIdx >= 2 && "x-logline--on")}>→ Detected: 3 Invoices, 2 Lorry Receipts, 2 PODs</div>
          <div className={cx("x-logline", stageIdx >= 3 && "x-logline--on")}>→ Extracted 142 fields · 12 flagged for review</div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Save Confirmation toast/overlay ----------------
function SaveConfirmation({ doc, remaining, onNext, onView }) {
  return (
    <div className="x-saveoverlay">
      <div className="x-savecard">
        <div className="x-savecard__check">{I.check}</div>
        <h3 className="x-savecard__h">Saved to database</h3>
        <p className="x-savecard__p">{doc.filename} · {doc.fields.flatMap(g => g.fields).length} fields stored</p>
        <div className="x-savecard__row">
          <Btn variant="ghost" onClick={onView}>View record</Btn>
          {remaining > 0
            ? <Btn variant="primary" icon={I.next} onClick={onNext} kbd="↵">Next document ({remaining})</Btn>
            : <Btn variant="primary" onClick={onNext}>Back to queue</Btn>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, EmptyState, UploadScreen, ProcessingScreen, SaveConfirmation });
