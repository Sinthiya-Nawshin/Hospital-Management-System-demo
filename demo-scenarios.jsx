// demo-scenarios.jsx — drives the app into specific states for demo/test

const { useState: _uS, useEffect: _uE } = React;
const uS = _uS;
const uE = _uE;

const SCENARIOS = [
  {
    id: "booking-conflict",
    title: "Booking conflict detection",
    blurb: "See live validation block a double-booked doctor, out-of-hours slot, and lunch overlap.",
    icon: "calendar",
    role: "receptionist",
    page: "appointments",
    action: "conflict",
  },
  {
    id: "allergy-block",
    title: "Allergy-blocked prescription",
    blurb: "Prescribe Amoxicillin to a penicillin-allergic patient — see the ECA rule block it.",
    icon: "pill",
    role: "doctor",
    page: "prescriptions",
    action: "allergy",
  },
  {
    id: "discharge-block",
    title: "Discharge blocked by unpaid bill",
    blurb: "Try to discharge a patient with a pending invoice — see the billing gate engage.",
    icon: "lock",
    role: "billing",
    page: "admissions",
    action: "discharge-block",
  },
  {
    id: "gender-room",
    title: "Gender-matched room assignment",
    blurb: "Admit a patient and watch rooms auto-filter to match gender and availability.",
    icon: "bed",
    role: "receptionist",
    page: "admissions",
    action: "gender-room",
  },
  {
    id: "out-of-hours",
    title: "Out-of-hours appointment",
    blurb: "Attempt to book an 18:30 appointment — business-hours rule rejects it.",
    icon: "clock",
    role: "receptionist",
    page: "appointments",
    action: "ooh",
  },
  {
    id: "low-stock",
    title: "Low stock alert",
    blurb: "Review pharmacy inventory — critical items are flagged and block dispensing.",
    icon: "vial",
    role: "billing",
    page: "pharmacy",
    action: null,
  },
];

function ScenarioLauncher({ open, onClose, onRun }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()} style={{ width: 780 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Demo scenarios</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Run a pre-scripted test case to see business rules and ECA triggers in action.
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body" style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => onRun(s)}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  borderRadius: 10,
                  padding: 14,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all .15s",
                  display: "flex",
                  gap: 12,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent-soft)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--hairline)"; e.currentTarget.style.background = "var(--surface)"; }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "var(--accent-soft)", color: "var(--accent-soft-ink)",
                  display: "grid", placeItems: "center", flexShrink: 0,
                }}>
                  <Icon name={s.icon} size={18}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--ink)", marginBottom: 3 }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>
                    {s.blurb}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                    <Badge variant="outline">{ROLES[s.role].label}</Badge>
                    <Badge variant="accent">{s.page}</Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <span style={{ flex: 1, fontSize: 11.5, color: "var(--muted)" }}>
            Tip: the role switcher (top right) also jumps between perspectives.
          </span>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// Hint / spotlight overlay
function Spotlight({ target, title, body, onNext, onSkip, step, total }) {
  const [rect, setRect] = uS(null);
  uE(() => {
    const el = document.querySelector(target);
    if (!el) return setRect(null);
    const update = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    update();
    window.addEventListener("resize", update);
    const t = setInterval(update, 400);
    return () => { window.removeEventListener("resize", update); clearInterval(t); };
  }, [target]);
  if (!rect) return null;
  const pad = 6;
  const tooltipTop = rect.top + rect.height + 12;
  const tooltipLeft = Math.max(16, Math.min(window.innerWidth - 320, rect.left));
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, pointerEvents: "none" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "auto" }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white"/>
            <rect
              x={rect.left - pad} y={rect.top - pad}
              width={rect.width + pad*2} height={rect.height + pad*2}
              rx="8" fill="black"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="oklch(0.22 0.02 250 / 0.55)" mask="url(#spotlight-mask)" onClick={onSkip}/>
        <rect
          x={rect.left - pad} y={rect.top - pad}
          width={rect.width + pad*2} height={rect.height + pad*2}
          rx="8" fill="none"
          stroke="var(--accent)" strokeWidth="2"
        />
      </svg>
      <div style={{
        position: "absolute", top: tooltipTop, left: tooltipLeft,
        width: 300, background: "var(--surface)",
        border: "1px solid var(--hairline-strong)",
        borderRadius: 10, padding: 14,
        boxShadow: "var(--shadow-lg)", pointerEvents: "auto",
      }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--accent-soft-ink)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
          Step {step} of {total}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>{body}</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, alignItems: "center" }}>
          <button className="btn sm ghost" onClick={onSkip}>Skip tour</button>
          <button className="btn sm primary" onClick={onNext}>
            {step === total ? "Done" : "Next"} <Icon name="chevRight" size={12}/>
          </button>
        </div>
      </div>
    </div>
  );
}

const TOUR_STEPS = [
  { target: ".brand", title: "Meridian HMS", body: "Hospital Management System — central hub for clinical, administrative, and financial operations." },
  { target: ".user-chip", title: "Switch roles", body: "Flip between Reception, Doctor, Billing, and Admin. Each role sees a different dashboard, nav, and actions." },
  { target: ".sidebar", title: "Modules", body: "All nine modules are here. Locked ones aren't in your current role's scope — switch role to unlock." },
  { target: "[data-tour='scenarios']", title: "Try a scenario", body: "Run a scripted test case — see conflict detection, allergy blocks, and discharge gates fire live. Close this tour then click here." },
];

Object.assign(window, { SCENARIOS, ScenarioLauncher, Spotlight, TOUR_STEPS });
