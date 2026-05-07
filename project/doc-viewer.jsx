// Document viewer — renders SVG document with overlay bounding boxes
// Two-way hover linking with field list.

function DocViewer({ doc, hoveredField, focusedField, onHoverField, onFocusField, highlightStyle = "box", scale = 1 }) {
  const allFields = doc.fields.flatMap(g => g.fields);

  const isPDF = doc.filename && doc.filename.toLowerCase().endsWith(".pdf");

  // Determine document source: real uploaded file, or mock SVG template
  let docSrc = doc.fileUrl || null;
  let useSvg = false;
  if (!docSrc) {
    const svg = window.DOC_SVGS[doc.id] || window.INVOICE_SVG;
    docSrc = window.svgDataUri(svg);
    useSvg = true;
  }

  const bboxOverlay = (
    <div className="x-docviewer__overlay">
      {allFields.map(f => {
        if (!f.bbox) return null;
        const [x, y, w, h] = f.bbox;
        const isHovered = hoveredField === f.key;
        const isFocused = focusedField === f.key;
        const lvl = window.confidenceLevel(f.confidence);
        return (
          <div
            key={f.key}
            className={cx(
              "x-bbox",
              `x-bbox--${highlightStyle}`,
              `x-bbox--${lvl}`,
              isHovered && "x-bbox--hover",
              isFocused && "x-bbox--focus",
            )}
            style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
            onMouseEnter={() => onHoverField && onHoverField(f.key)}
            onMouseLeave={() => onHoverField && onHoverField(null)}
            onClick={() => onFocusField && onFocusField(f.key)}
          >
            {(isHovered || isFocused) && (
              <div className="x-bbox__tag">{f.label}</div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="x-docviewer" style={{ "--scale": scale }}>
      <div className="x-docviewer__page">
        {!useSvg && isPDF ? (
          // Real PDF — use iframe, no bbox overlay (PDF coordinates differ)
          <iframe
            src={docSrc}
            title={doc.filename}
            className="x-docviewer__pdf"
          />
        ) : (
          // Image or mock SVG — show with bbox overlay
          <>
            <img src={docSrc} alt={doc.filename} className="x-docviewer__img" draggable={false}/>
            {bboxOverlay}
          </>
        )}
      </div>
    </div>
  );
}

// Field row — editable, with confidence indicator
function FieldRow({ field, value, edited, hovered, focused, onChange, onHover, onFocus, onBlur, onFlag, density = "compact", showConfidence = true }) {
  const lvl = window.confidenceLevel(field.confidence);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (focused && inputRef.current) inputRef.current.focus();
  }, [focused]);

  return (
    <div
      className={cx(
        "x-field",
        `x-field--${density}`,
        `x-field--${lvl}`,
        hovered && "x-field--hover",
        focused && "x-field--focus",
        edited && "x-field--edited",
      )}
      onMouseEnter={() => onHover && onHover(field.key)}
      onMouseLeave={() => onHover && onHover(null)}
    >
      <div className="x-field__head">
        <label className="x-field__lbl" htmlFor={`f-${field.key}`}>
          {field.label}
        </label>
        {showConfidence && <ConfidenceDot confidence={field.confidence}/>}
        {edited && <span className="x-field__edited" title="Edited">●</span>}
      </div>
      <div className="x-field__inputwrap">
        <input
          id={`f-${field.key}`}
          ref={inputRef}
          className="x-field__input"
          value={value}
          onChange={e => onChange(field.key, e.target.value)}
          onFocus={() => onFocus && onFocus(field.key)}
          onBlur={() => onBlur && onBlur(field.key)}
          spellCheck={false}
        />
        {lvl === "low" && (
          <button className="x-field__flag" onClick={() => onFlag && onFlag(field.key)} title="Low confidence — please verify">
            {I.alert}
          </button>
        )}
      </div>
      {showConfidence && (
        <div className="x-field__meta">
          <ConfidenceBar confidence={field.confidence}/>
          <span className="x-field__pct">{Math.round(field.confidence * 100)}%</span>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { DocViewer, FieldRow });
