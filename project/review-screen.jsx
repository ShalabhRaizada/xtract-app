// Review screen — document image side-by-side with editable extracted fields
// This is the main screen the auditor lives in.

function ReviewScreen({
  doc, queueRemaining, queueIndex, queueTotal,
  onSave, onSkip, onPrev, onReject,
  layout = "split", density = "compact", showConfidence = true, highlightStyle = "box",
}) {
  // values: editable copy of extracted values
  const [values, setValues] = useState(() => {
    const v = {};
    doc.fields.forEach(g => g.fields.forEach(f => { v[f.key] = f.value; }));
    return v;
  });
  const [edited, setEdited] = useState({});
  const [hoveredField, setHoveredField] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [scale, setScale] = useState(1);
  const [filter, setFilter] = useState("all"); // all | low | edited

  // reset on doc change
  useEffect(() => {
    const v = {};
    doc.fields.forEach(g => g.fields.forEach(f => { v[f.key] = f.value; }));
    setValues(v); setEdited({}); setHoveredField(null); setFocusedField(null);
  }, [doc.id]);

  const allFields = useMemo(() => doc.fields.flatMap(g => g.fields), [doc.id]);
  const lowConf = allFields.filter(f => f.confidence < 0.75).length;
  const editedCount = Object.keys(edited).length;
  const totalFields = allFields.length;

  function handleChange(key, val) {
    setValues(v => ({ ...v, [key]: val }));
    setEdited(e => ({ ...e, [key]: true }));
  }

  function visibleGroup(g) {
    if (filter === "all") return g.fields;
    if (filter === "low") return g.fields.filter(f => f.confidence < 0.75);
    if (filter === "edited") return g.fields.filter(f => edited[f.key]);
    return g.fields;
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        if (e.key === "Escape") e.target.blur();
        return;
      }
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onSave(values, edited); }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onSave(values, edited); }
      if (e.key === "n") { e.preventDefault(); onSkip && onSkip(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [values, edited]);

  return (
    <div className={cx("x-review", `x-review--${layout}`, `x-review--${density}`)}>
      {/* Sub-toolbar — doc context */}
      <div className="x-reviewbar">
        <div className="x-reviewbar__left">
          <button className="x-iconbtn" onClick={onPrev} disabled={queueIndex === 0} title="Previous (P)">{I.prev}</button>
          <div className="x-reviewbar__doc">
            <DocTypeBadge type={doc.type} label={doc.typeLabel}/>
            <span className="x-reviewbar__filename">{doc.filename}</span>
          </div>
          <span className="x-reviewbar__progress">{queueIndex + 1}/{queueTotal}</span>
        </div>
        <div className="x-reviewbar__right">
          <div className="x-statgroup x-statgroup--warn">
            <span className="x-statgroup__lbl">Flag</span>
            <span className="x-statgroup__val">{lowConf}</span>
          </div>
          <div className="x-statgroup x-statgroup--ok">
            <span className="x-statgroup__lbl">Edit</span>
            <span className="x-statgroup__val">{editedCount}</span>
          </div>
          <div className="x-divider"/>
          <Btn variant="ghost" size="sm" onClick={onReject} title="Reject (R)">Reject</Btn>
          <Btn variant="ghost" size="sm" onClick={onSkip} title="Skip (N)">Skip</Btn>
          <Btn variant="primary" size="sm" icon={I.save} onClick={() => onSave(values, edited)} kbd="⌘S">Save</Btn>
        </div>
      </div>

      {/* Two-pane main */}
      <div className="x-reviewmain">
        {/* Doc pane */}
        <div className="x-pane x-pane--doc">
          <div className="x-pane__head">
            <span className="x-pane__title">Source document</span>
            <div className="x-pane__tools">
              <button className="x-iconbtn" onClick={() => setScale(s => Math.max(0.5, s - 0.1))} title="Zoom out">{I.zoomOut}</button>
              <span className="x-zoomval">{Math.round(scale * 100)}%</span>
              <button className="x-iconbtn" onClick={() => setScale(s => Math.min(2, s + 0.1))} title="Zoom in">{I.zoomIn}</button>
              <button className="x-iconbtn" onClick={() => setScale(1)} title="Fit">{I.fit}</button>
              <button className="x-iconbtn" title="Rotate">{I.rotate}</button>
            </div>
          </div>
          <div className="x-pane__body x-pane__body--scroll">
            <DocViewer
              doc={doc}
              hoveredField={hoveredField}
              focusedField={focusedField}
              onHoverField={setHoveredField}
              onFocusField={setFocusedField}
              highlightStyle={highlightStyle}
              scale={scale}
            />
          </div>
        </div>

        {/* Fields pane */}
        <div className="x-pane x-pane--fields">
          <div className="x-pane__head">
            <span className="x-pane__title">Extracted fields</span>
            <div className="x-pane__tools">
              <div className="x-segmented">
                <button className={cx("x-seg", filter === "all" && "x-seg--on")} onClick={() => setFilter("all")}>All ({totalFields})</button>
                <button className={cx("x-seg", filter === "low" && "x-seg--on")} onClick={() => setFilter("low")}>
                  Flagged {lowConf > 0 && <span className="x-seg__count">{lowConf}</span>}
                </button>
                <button className={cx("x-seg", filter === "edited" && "x-seg--on")} onClick={() => setFilter("edited")}>Edited</button>
              </div>
            </div>
          </div>
          <div className="x-pane__body x-pane__body--scroll">
            {doc.fields.length === 0 ? (
              <div className="x-extract-error">
                <div className="x-extract-error__ico">{I.alert}</div>
                <div className="x-extract-error__title">
                  {doc.status === "error" ? "Extraction failed" : "No fields extracted"}
                </div>
                <div className="x-extract-error__body">
                  {doc.error
                    ? <><strong>Error:</strong> {doc.error}<br/><br/></>
                    : null}
                  To extract fields, you need an Anthropic API key.<br/>
                  <strong>Option 1 — Server:</strong> set <code>ANTHROPIC_API_KEY</code> before running <code>npm start</code>.<br/>
                  <strong>Option 2 — Browser:</strong> re-upload and enter your key when prompted.<br/>
                  <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">Get a key →</a>
                </div>
              </div>
            ) : (
              doc.fields.map(group => {
                const visible = visibleGroup(group);
                if (visible.length === 0) return null;
                return (
                  <div key={group.group} className="x-fieldgroup">
                    <div className="x-fieldgroup__head">
                      <span>{group.group}</span>
                      <span className="x-fieldgroup__count">{visible.length}</span>
                    </div>
                    <div className="x-fieldgroup__body">
                      {visible.map(field => (
                        <FieldRow
                          key={field.key}
                          field={field}
                          value={values[field.key] ?? ""}
                          edited={edited[field.key]}
                          hovered={hoveredField === field.key}
                          focused={focusedField === field.key}
                          onChange={handleChange}
                          onHover={setHoveredField}
                          onFocus={setFocusedField}
                          onBlur={() => setFocusedField(null)}
                          density={density}
                          showConfidence={showConfidence}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
            {doc.fields.length > 0 && (
              <div className="x-addfield">
                <Btn variant="ghost" size="sm" icon={I.add}>Add custom field</Btn>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ReviewScreen });
