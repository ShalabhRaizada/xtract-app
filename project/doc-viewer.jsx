// Document viewer — renders document image with overlay bounding boxes
// Supports rotation (0/90/180/270°) and canvas-based image enhancement.

// ── Image enhancement (unsharp mask + contrast) ──────────────────────────────
function enhanceImage(imgEl, callback) {
  const MAX = 2000;
  let w = imgEl.naturalWidth, h = imgEl.naturalHeight;
  if (!w || !h) { callback(null); return; }

  const ratio = Math.min(MAX / w, MAX / h, 1);
  w = Math.round(w * ratio);
  h = Math.round(h * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgEl, 0, 0, w, h);

  const orig = ctx.getImageData(0, 0, w, h);
  const src  = orig.data;

  // Pass 1 — mild 3×3 box blur for noise reduction
  const blurred = new Float32Array(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, cnt = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const px = Math.min(Math.max(x + dx, 0), w - 1);
          const py = Math.min(Math.max(y + dy, 0), h - 1);
          const i = (py * w + px) * 4;
          r += src[i]; g += src[i + 1]; b += src[i + 2]; cnt++;
        }
      }
      const i = (y * w + x) * 4;
      blurred[i] = r / cnt; blurred[i + 1] = g / cnt; blurred[i + 2] = b / cnt;
    }
  }

  // Pass 2 — unsharp mask: out = orig + strength*(orig − blurred)
  const strength = 1.4;
  const out = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      // unsharp mask
      let v = src[i + c] + strength * (src[i + c] - blurred[i + c]);
      // contrast boost: pull midtones away from 128
      v = 128 + (v - 128) * 1.15;
      out[i + c] = Math.min(255, Math.max(0, v));
    }
    out[i + 3] = src[i + 3];
  }

  ctx.putImageData(new ImageData(out, w, h), 0, 0);
  callback(canvas.toDataURL("image/jpeg", 0.93));
}

// ── DocViewer ─────────────────────────────────────────────────────────────────
function DocViewer({
  doc, hoveredField, focusedField, onHoverField, onFocusField,
  highlightStyle = "box", scale = 1, rotation = 0, enhanced = false,
}) {
  const imgRef   = React.useRef(null);
  const pageRef  = React.useRef(null);
  const [imgLoaded,   setImgLoaded]   = React.useState(false);
  const [marginPx,    setMarginPx]    = React.useState(0);
  const [enhancedSrc, setEnhancedSrc] = React.useState(null);
  const [enhancing,   setEnhancing]   = React.useState(false);

  // Recompute layout compensation whenever rotation or image changes
  React.useEffect(() => {
    const transposed = rotation === 90 || rotation === 270;
    if (!transposed || !imgRef.current || !pageRef.current) { setMarginPx(0); return; }
    const img = imgRef.current;
    if (!img.complete || !img.naturalWidth) { setMarginPx(0); return; }
    const renderedW = pageRef.current.offsetWidth;
    const renderedH = renderedW * img.naturalHeight / img.naturalWidth;
    setMarginPx((renderedW - renderedH) / 2);
  }, [rotation, imgLoaded]);

  // Run enhancement when toggled on (only for images, not PDFs, not mock SVGs)
  const isPDF   = doc.filename && doc.filename.toLowerCase().endsWith(".pdf");
  const hasFile = !!doc.fileUrl;

  React.useEffect(() => {
    if (!enhanced || enhancedSrc || isPDF || !hasFile) return;
    if (!imgRef.current || !imgRef.current.complete) return;
    setEnhancing(true);
    enhanceImage(imgRef.current, result => {
      setEnhancedSrc(result || null);
      setEnhancing(false);
    });
  }, [enhanced, imgLoaded]);

  // Reset enhanced src when document changes
  React.useEffect(() => {
    setEnhancedSrc(null);
    setEnhancing(false);
    setImgLoaded(false);
    setMarginPx(0);
  }, [doc.id]);

  const allFields = doc.fields.flatMap(g => g.fields);

  // Resolve source: enhanced > real file > mock SVG
  let docSrc, useSvg = false;
  if (enhanced && enhancedSrc) {
    docSrc = enhancedSrc;
  } else if (doc.fileUrl) {
    docSrc = doc.fileUrl;
  } else {
    const svg = window.DOC_SVGS[doc.id] || window.INVOICE_SVG;
    docSrc = window.svgDataUri(svg);
    useSvg = true;
  }

  const transposed = rotation === 90 || rotation === 270;
  const pageStyle  = {
    transform:      `rotate(${rotation}deg)`,
    transformOrigin:"center",
    transition:     "transform 0.25s",
    marginTop:      marginPx,
    marginBottom:   marginPx,
  };

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
              "x-bbox", `x-bbox--${highlightStyle}`, `x-bbox--${lvl}`,
              isHovered && "x-bbox--hover",
              isFocused && "x-bbox--focus",
            )}
            style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
            onMouseEnter={() => onHoverField && onHoverField(f.key)}
            onMouseLeave={() => onHoverField && onHoverField(null)}
            onClick={() => onFocusField && onFocusField(f.key)}
          >
            {(isHovered || isFocused) && <div className="x-bbox__tag">{f.label}</div>}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="x-docviewer" style={{ "--scale": scale }}>
      {enhancing && (
        <div className="x-docviewer__enhancing">Enhancing image…</div>
      )}
      <div ref={pageRef} className="x-docviewer__page" style={pageStyle}>
        {!useSvg && isPDF ? (
          <iframe src={docSrc} title={doc.filename} className="x-docviewer__pdf"/>
        ) : (
          <>
            <img
              ref={imgRef}
              src={docSrc}
              alt={doc.filename}
              className="x-docviewer__img"
              draggable={false}
              onLoad={() => setImgLoaded(true)}
            />
            {/* Bboxes align with original orientation; hide when transposed to avoid confusion */}
            {!transposed && bboxOverlay}
          </>
        )}
      </div>
    </div>
  );
}

// ── FieldRow ──────────────────────────────────────────────────────────────────
function FieldRow({ field, value, edited, hovered, focused, onChange, onHover, onFocus, onBlur, onFlag, density = "compact", showConfidence = true }) {
  const lvl = window.confidenceLevel(field.confidence);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (focused && inputRef.current) inputRef.current.focus();
  }, [focused]);

  return (
    <div
      className={cx(
        "x-field", `x-field--${density}`, `x-field--${lvl}`,
        hovered  && "x-field--hover",
        focused  && "x-field--focus",
        edited   && "x-field--edited",
      )}
      onMouseEnter={() => onHover && onHover(field.key)}
      onMouseLeave={() => onHover && onHover(null)}
    >
      <div className="x-field__head">
        <label className="x-field__lbl" htmlFor={`f-${field.key}`}>{field.label}</label>
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
