// Shared UI primitives for xTract — dense data-tool aesthetic
// Uses CSS variables defined in xtract.html

function cx(...parts) { return parts.filter(Boolean).join(" "); }

function confidenceLevel(c) {
  if (c >= 0.9) return "high";
  if (c >= 0.75) return "med";
  return "low";
}

function ConfidenceDot({ confidence, show = true }) {
  if (!show) return null;
  const lvl = confidenceLevel(confidence);
  return (
    <span className={`x-conf-dot x-conf-${lvl}`} title={`${Math.round(confidence * 100)}% confidence`}>
      <span className="x-conf-dot__inner"/>
    </span>
  );
}

function ConfidenceBar({ confidence }) {
  const lvl = confidenceLevel(confidence);
  return (
    <span className={`x-conf-bar x-conf-${lvl}`}>
      <span className="x-conf-bar__fill" style={{ width: `${Math.round(confidence * 100)}%` }}/>
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: { label: "Pending", cls: "x-pill--neutral" },
    processing: { label: "Processing", cls: "x-pill--info" },
    review: { label: "Needs review", cls: "x-pill--warn" },
    "Needs review": { label: "Needs review", cls: "x-pill--warn" },
    Verified: { label: "Verified", cls: "x-pill--ok" },
    saved: { label: "Saved", cls: "x-pill--ok" },
  };
  const c = map[status] || { label: status, cls: "x-pill--neutral" };
  return <span className={`x-pill ${c.cls}`}>{c.label}</span>;
}

function DocTypeBadge({ type, label }) {
  const colors = {
    invoice: { bg: "var(--type-invoice-bg)", fg: "var(--type-invoice-fg)", letter: "I" },
    lorry: { bg: "var(--type-lorry-bg)", fg: "var(--type-lorry-fg)", letter: "L" },
    pod: { bg: "var(--type-pod-bg)", fg: "var(--type-pod-fg)", letter: "P" },
  };
  const c = colors[type] || colors.invoice;
  return (
    <span className="x-doctype">
      <span className="x-doctype__sq" style={{ background: c.bg, color: c.fg }}>{c.letter}</span>
      <span className="x-doctype__lbl">{label}</span>
    </span>
  );
}

function Btn({ children, variant = "default", size = "md", icon, onClick, disabled, kbd, type, title }) {
  return (
    <button
      type={type || "button"}
      className={cx("x-btn", `x-btn--${variant}`, `x-btn--${size}`)}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {icon && <span className="x-btn__ico">{icon}</span>}
      <span>{children}</span>
      {kbd && <kbd className="x-kbd">{kbd}</kbd>}
    </button>
  );
}

// ---- Icons (16px stroke) ----
const I = {
  upload: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 11V3M8 3l-3 3M8 3l3 3M3 11v2h10v-2"/></svg>,
  doc:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2h6l4 4v8H3zM9 2v4h4M5 9h6M5 11.5h6M5 6.5h2"/></svg>,
  check:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7"/></svg>,
  alert:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 5v3.5M8 11v.01M8 1.5l6.5 12h-13z"/></svg>,
  search: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>,
  next:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>,
  prev:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M13 8H3M7 4L3 8l4 4"/></svg>,
  zoomIn: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14M5 7h4M7 5v4"/></svg>,
  zoomOut:<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14M5 7h4"/></svg>,
  fit:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6V3h3M13 6V3h-3M3 10v3h3M13 10v3h-3"/></svg>,
  rotate: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M13 8a5 5 0 1 1-1.5-3.5L13 6M13 3v3h-3"/></svg>,
  enhance:<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.6 3.6l1.3 1.3M11.1 11.1l1.3 1.3M11.1 4.9l-1.3 1.3M4.9 11.1l-1.3 1.3"/></svg>,
  trash:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h10M6 4V2.5h4V4M5 4l.5 9h5L11 4M7 7v4M9 7v4"/></svg>,
  save:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h8l2 2v8H3zM5 3v3h6V3M5 13V9h6v4"/></svg>,
  reset:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8a5 5 0 1 0 5-5M3 3v3h3"/></svg>,
  filter: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h12l-4.5 6v4l-3 1V9z"/></svg>,
  more:   <svg viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="13" cy="8" r="1.2"/></svg>,
  add:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>,
  spark:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"><path d="M8 2l1.5 4.5L14 8l-4.5 1.5L8 14l-1.5-4.5L2 8l4.5-1.5z"/></svg>,
  link:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 9.5L9 7.5M6 11l-1 1a2 2 0 0 1-3-3l2-2a2 2 0 0 1 3 0M10 5l1-1a2 2 0 0 1 3 3l-2 2a2 2 0 0 1-3 0"/></svg>,
  flag:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14V2M3 3h9l-2 3 2 3H3"/></svg>,
  download: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v9M8 11l-3-3M8 11l3-3M3 13h10"/></svg>,
};

// Avatar
function Avatar({ name = "Audit Op", size = 28 }) {
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="x-avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initials}
    </span>
  );
}

// Toast
function Toast({ children, kind = "info", onClose }) {
  return (
    <div className={`x-toast x-toast--${kind}`}>
      <span className="x-toast__ico">{kind === "ok" ? I.check : I.alert}</span>
      <span>{children}</span>
      {onClose && <button className="x-toast__x" onClick={onClose}>×</button>}
    </div>
  );
}

Object.assign(window, {
  cx, confidenceLevel, ConfidenceDot, ConfidenceBar, StatusPill,
  DocTypeBadge, Btn, I, Avatar, Toast,
});
