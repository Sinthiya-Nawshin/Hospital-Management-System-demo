// shared.jsx — icons, Avatar, small helpers used everywhere
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// Inline SVG icons. Stroke inherits currentColor.
const Icon = ({ name, size = 16, strokeWidth = 1.75, style }) => {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth,
    strokeLinecap: "round", strokeLinejoin: "round", style,
  };
  const P = {
    dashboard:    <><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>,
    patients:     <><circle cx="9" cy="7" r="4"/><path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="3"/><path d="M21 21c0-2.2-1.8-4-4-4"/></>,
    calendar:     <><rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></>,
    bed:          <><path d="M3 20V8m0 6h18v6M3 14h10V8h8v6"/><circle cx="7" cy="11" r="2"/></>,
    pill:         <><path d="M10.5 20.5a6 6 0 0 1-7-7l7-7a6 6 0 0 1 7 7z"/><path d="M8.5 8.5l7 7"/></>,
    billing:      <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6M7 17h4"/></>,
    ambulance:    <><path d="M2 17V8a1 1 0 0 1 1-1h11v10"/><path d="M14 10h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M9 11h2m-1-1v2"/></>,
    staff:        <><path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5zM4 22c0-4 3.6-7 8-7s8 3 8 7"/></>,
    building:     <><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2"/></>,
    search:       <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    bell:         <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    plus:         <><path d="M12 5v14M5 12h14"/></>,
    chevRight:    <><path d="m9 6 6 6-6 6"/></>,
    chevDown:     <><path d="m6 9 6 6 6-6"/></>,
    chevLeft:     <><path d="m15 6-6 6 6 6"/></>,
    x:            <><path d="M18 6 6 18M6 6l12 12"/></>,
    check:        <><path d="M5 12.5 10 17.5 20 7.5"/></>,
    warn:         <><path d="M12 3.5 1.5 21h21L12 3.5z"/><path d="M12 10v5M12 18v.01"/></>,
    info:         <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/></>,
    shield:       <><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></>,
    stethoscope:  <><path d="M5 3v6a5 5 0 0 0 10 0V3M8 3v3M12 3v3"/><path d="M10 14v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/></>,
    download:     <><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/></>,
    filter:       <><path d="M3 5h18l-7 9v6l-4-2v-4z"/></>,
    more:         <><circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/></>,
    edit:         <><path d="M14 4l6 6-11 11H3v-6z"/></>,
    flag:         <><path d="M4 21V4h13l-2 4 2 4H4"/></>,
    clock:        <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    user:         <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></>,
    sparkle:      <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/></>,
    dna:          <><path d="M6 3c0 6 12 6 12 12s-12 6-12 12M18 3c0 6-12 6-12 12s12 6 12 12"/></>,
    vial:         <><path d="M9 2h6M10 2v10l-3 5a4 4 0 0 0 7 4l3-5V2"/><path d="M7 13h10"/></>,
    lock:         <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
    signature:    <><path d="M3 17c4-4 6-10 10-10s2 10 6 10"/><path d="M3 21h18"/></>,
    activity:     <><path d="M3 12h4l3-8 4 16 3-8h4"/></>,
    alert:        <><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16v.01"/></>,
    logout:       <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l-5-5 5-5M5 12h12"/></>,
    settings:     <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></>,
    trash:        <><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></>,
    refresh:      <><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></>,
  };
  return <svg {...common}>{P[name] || null}</svg>;
};

function Avatar({ name, hue = 245, size = 28, square = false }) {
  const initials = (name || "?").split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();
  const bg = `oklch(0.62 0.11 ${hue})`;
  return (
    <div className="avatar" style={{
      width: size, height: size,
      fontSize: size * 0.38,
      background: bg,
      borderRadius: square ? 6 : "50%",
    }}>{initials}</div>
  );
}

// Deterministic hue from id string
function hueOf(str) {
  let h = 0;
  for (let i = 0; i < (str||"").length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}

function Badge({ variant = "", children, dot = false }) {
  return (
    <span className={`badge ${variant}`}>
      {dot && <span className="dot"/>}
      {children}
    </span>
  );
}

// Minimal sparkline
function Spark({ points = [5,7,6,9,8,10,11,10,13], color = "var(--accent)" }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 80, h = 28;
  const step = w / (points.length - 1);
  const path = points.map((p,i) => {
    const x = i * step;
    const y = h - ((p - min) / (max - min || 1)) * h;
    return `${i===0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      <path d={`${path} L${w},${h} L0,${h} Z`} fill={color} opacity="0.1"/>
    </svg>
  );
}

// Age from DOB yyyy-mm-dd
function ageFromDob(dob) {
  const now = new Date();
  const d = new Date(dob);
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

// Format time-from-9am as HH:MM
function minToTime(min) {
  const totalMin = 9*60 + min;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

function currency(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function daysAgo(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

// Toast system
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((text, kind = "", ms = 2500) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, text, kind }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), ms);
  }, []);
  const node = (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.kind}`}>
          {t.kind === "ok" && <Icon name="check" size={14}/>}
          {t.kind === "warn" && <Icon name="warn" size={14}/>}
          {t.kind === "danger" && <Icon name="alert" size={14}/>}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
  return [push, node];
}

Object.assign(window, {
  Icon, Avatar, Badge, Spark,
  ageFromDob, minToTime, currency, daysAgo, hueOf, useToasts,
});
