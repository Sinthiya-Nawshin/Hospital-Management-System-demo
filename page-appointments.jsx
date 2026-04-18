// page-appointments.jsx — HERO FLOW: booking with conflict detection

const BUSINESS_START = 0;      // 09:00
const BUSINESS_END   = 8 * 60; // 17:00 = 480 min from 9
const SLOT_MIN = 15;           // 15-min grid
const SLOT_PX = 18;            // pixels per 15-min slot => 72px = 1 hour; 30-min = 36px (fits 2 lines)

function dayLabel(offset) {
  const names = ["Mon","Tue","Wed","Thu","Fri"];
  const d = new Date(WEEK_START.getTime() + offset*86400000);
  return { name: names[offset], num: d.getDate(), month: d.toLocaleString("en-US",{month:"short"}), iso: d.toISOString().slice(0,10) };
}

// Check if two spans overlap
function overlaps(aStart, aDur, bStart, bDur) {
  return aStart < bStart + bDur && bStart < aStart + aDur;
}

function Appointments({ role, pushToast, scenario, consumeScenario }) {
  const [appts, setAppts] = useState(APPOINTMENTS);
  const [selectedDoctor, setSelectedDoctor] = useState(role === "doctor" ? "D-1042" : "all");
  const [view, setView] = useState("week"); // week | day
  const [draftModal, setDraftModal] = useState(null);
  const [activeAppt, setActiveAppt] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);

  // Scenario auto-actions
  useEffect(() => {
    if (!scenario) return;
    if (scenario.action === "conflict") {
      // Open a booking that conflicts with Dr Okafor's 10:00 slot
      setDraftModal({ day: 2, startMin: 60, dur: 30, doctorId: "D-1042", type: "consultation", patientId: PATIENTS[0]?.id || "", notes: "" });
    } else if (scenario.action === "ooh") {
      setDraftModal({ day: 2, startMin: 570, dur: 30, doctorId: "D-1042", type: "consultation", patientId: PATIENTS[0]?.id || "", notes: "" });
    }
    consumeScenario?.();
  }, [scenario]);

  // Filter visible doctors
  const visibleDocs = selectedDoctor === "all" ? DOCTORS : DOCTORS.filter(d => d.id === selectedDoctor);
  const visibleDocIds = new Set(visibleDocs.map(d => d.id));
  const filtered = appts.filter(a => visibleDocIds.has(a.doctorId));

  // "Now" marker (assume today = Wed = day 2)
  const now = new Date();
  const todayIdx = 2;
  const nowMin = (now.getHours() - 9) * 60 + now.getMinutes();

  const openBookingAt = (dayIdx, startMin, doctorId) => {
    // Guard: must be within business hours
    if (startMin < BUSINESS_START || startMin >= BUSINESS_END) return;
    setDraftModal({ day: dayIdx, startMin, dur: 30, doctorId: doctorId || (selectedDoctor !== "all" ? selectedDoctor : DOCTORS[0].id), type: "consultation", patientId: "", notes: "" });
  };

  const commitAppt = (draft) => {
    if (draft._rescheduling) {
      setAppts(xs => xs.map(a => a.id === draft._rescheduling ? { ...a, day: draft.day, startMin: draft.startMin, dur: draft.dur, doctorId: draft.doctorId, type: draft.type, notes: draft.notes } : a));
      const pt = PATIENTS.find(p => p.id === draft.patientId);
      pushToast(`Appointment rescheduled — ${pt?.name} → ${dayLabel(draft.day).name} ${minToTime(draft.startMin)}`, "ok");
    } else {
      setAppts(xs => [...xs, { ...draft, id: "A-" + Math.floor(Math.random()*99000 + 10500), room: "AUTO" }]);
      const pt = PATIENTS.find(p => p.id === draft.patientId);
      const doc = DOCTORS.find(d => d.id === draft.doctorId);
      pushToast(`Appointment booked — ${pt?.name} with ${doc?.name} at ${minToTime(draft.startMin)}`, "ok");
    }
    setDraftModal(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">
            Week of {dayLabel(0).month} {dayLabel(0).num} — {dayLabel(4).month} {dayLabel(4).num}
            {" · "}Business hours 09:00–17:00
          </p>
        </div>
        <div className="page-actions">
          <div className="segmented">
            <button className={view === "day" ? "on" : ""} onClick={() => setView("day")}>Day</button>
            <button className={view === "week" ? "on" : ""} onClick={() => setView("week")}>Week</button>
          </div>
          <button className="btn" onClick={() => pushToast("Filters: coming soon", "")}><Icon name="filter" size={13}/> Filter</button>
          <button className="btn primary" onClick={() => openBookingAt(todayIdx, 60, visibleDocs[0]?.id)}>
            <Icon name="plus" size={13}/> New appointment
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div className="row" style={{ gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Doctor:</span>
          <select className="select" style={{ width: 220 }} value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
            <option value="all">All doctors ({DOCTORS.length})</option>
            {DOCTORS.map(d => (
              <option key={d.id} value={d.id}>{d.name} — {DEPARTMENTS.find(x => x.id === d.dept).name}</option>
            ))}
          </select>
        </div>
        <LegendChips/>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)", display: "flex", gap: 12 }}>
          <span><b style={{ color: "var(--ink)" }}>{filtered.length}</b> appointments</span>
          <span><b style={{ color: "var(--ink)" }}>{filtered.filter(a => a.day === todayIdx).length}</b> today</span>
        </div>
      </div>

      <Scheduler
        view={view}
        days={view === "week" ? [0,1,2,3,4] : [todayIdx]}
        doctors={visibleDocs}
        appts={filtered}
        todayIdx={todayIdx}
        nowMin={nowMin}
        hoverCell={hoverCell}
        onHoverCell={setHoverCell}
        onCellClick={(dayIdx, startMin) => openBookingAt(dayIdx, startMin)}
        onApptClick={setActiveAppt}
        draftModal={draftModal}
      />

      {draftModal && (
        <BookingModal
          draft={draftModal}
          setDraft={setDraftModal}
          allAppts={appts}
          onCommit={commitAppt}
          onCancel={() => setDraftModal(null)}
        />
      )}
      {activeAppt && (
        <AppointmentDetailModal
          appt={activeAppt}
          onClose={() => setActiveAppt(null)}
          onCheckIn={() => { pushToast(`Checked in — ${PATIENTS.find(p => p.id === activeAppt.patientId)?.name}`, "ok"); setActiveAppt(null); }}
          onReschedule={() => {
            setDraftModal({
              day: activeAppt.day, startMin: activeAppt.startMin, dur: activeAppt.dur,
              doctorId: activeAppt.doctorId, type: activeAppt.type,
              patientId: activeAppt.patientId, notes: activeAppt.notes || "",
              _rescheduling: activeAppt.id,
            });
            setActiveAppt(null);
          }}
        />
      )}
    </div>
  );
}

function LegendChips() {
  return (
    <div className="row" style={{ gap: 8 }}>
      {Object.entries(APPT_TYPES).map(([k,v]) => {
        const color = k === "consultation" ? "var(--accent)" :
                      k === "followup" ? "var(--violet)" :
                      k === "checkup" ? "var(--ok)" :
                      k === "procedure" ? "var(--warn)" : "var(--danger)";
        return (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--muted)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: color }}/>
            {v.label}
          </div>
        );
      })}
    </div>
  );
}

function Scheduler({ view, days, doctors, appts, todayIdx, nowMin, hoverCell, onHoverCell, onCellClick, onApptClick }) {
  // Grid: 60px time column + N day columns
  const times = [];
  for (let m = BUSINESS_START - 60; m <= BUSINESS_END + 60; m += 30) {
    times.push(m);
  }
  // Show full 08:00 - 18:00 so closed shading is visible
  const gridStart = -60;
  const gridEnd   = BUSINESS_END + 60;
  const slotCount = (gridEnd - gridStart) / SLOT_MIN;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `60px repeat(${days.length}, 1fr)`,
        position: "relative",
      }}>
        {/* Header row */}
        <div className="sched-hd"/>
        {days.map(d => {
          const lbl = dayLabel(d);
          const isToday = d === todayIdx;
          return (
            <div key={d} className={`sched-hd day-hd ${isToday ? "today" : ""}`}>
              <span className="day-num">{lbl.num}</span>
              {lbl.name} {isToday && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--accent-soft-ink)", fontWeight: 600 }}>· Today</span>}
            </div>
          );
        })}

        {/* Body: rows per 30-min */}
        {times.map((m, i) => {
          const showLabel = m % 60 === 0;
          const hh = ((9*60 + m)/60) | 0;
          const label = `${String(hh).padStart(2,"0")}:${m % 60 === 0 ? "00" : "30"}`;
          return (
            <React.Fragment key={m}>
              <div className="sched-time" style={{ height: SLOT_PX * 2 }}>
                {showLabel && label}
              </div>
              {days.map(d => {
                const isClosed = m < BUSINESS_START || m >= BUSINESS_END;
                return (
                  <div key={d + "-" + m}
                    className={`sched-cell ${isClosed ? "closed" : ""}`}
                    style={{ height: SLOT_PX * 2 }}
                    onMouseEnter={() => !isClosed && onHoverCell({day: d, startMin: m})}
                    onMouseLeave={() => onHoverCell(null)}
                    onClick={() => !isClosed && onCellClick(d, m)}
                    title={isClosed ? "Outside business hours" : `Book at ${label}`}
                  />
                );
              })}
            </React.Fragment>
          );
        })}

        {/* Overlay appointments */}
        {days.map((d, dayIdx) => {
          const dayAppts = appts.filter(a => a.day === d);
          const colStart = 60;
          const colWidth = `calc((100% - 60px) / ${days.length})`;
          // Layout appointments in columns if overlapping
          const cols = layoutOverlaps(dayAppts);
          return cols.map((a) => {
            const doc = DOCTORS.find(x => x.id === a.doctorId);
            const pt = PATIENTS.find(x => x.id === a.patientId);
            const top = headerHeight + ((a.startMin - gridStart) / SLOT_MIN) * SLOT_PX;
            const height = (a.dur / SLOT_MIN) * SLOT_PX - 2;
            const left = `calc(60px + ${dayIdx} * (100% - 60px) / ${days.length} + ${a._col} * ((100% - 60px) / ${days.length} / ${a._colCount}))`;
            const width = `calc((100% - 60px) / ${days.length} / ${a._colCount} - 4px)`;
            const isCompact = height < 48;
            return (
              <div
                key={a.id}
                className={`sched-event ${APPT_TYPES[a.type]?.cls || ""} ${isCompact ? "compact" : ""}`}
                style={{ position: "absolute", top, height, left, width }}
                onClick={(e) => { e.stopPropagation(); onApptClick(a); }}
                title={`${minToTime(a.startMin)}–${minToTime(a.startMin + a.dur)} · ${pt?.name || ""} · ${doc?.name || ""}`}
              >
                <div className="ev-time">{minToTime(a.startMin)} · {doc?.name.split(" ").slice(-1)[0]}</div>
                {height >= 28 && <div className="ev-pt">{pt?.name}</div>}
                {height > 52 && (
                  <div style={{ fontSize: 10.5, opacity: 0.75, marginTop: 2 }}>{APPT_TYPES[a.type]?.label} · {a.room}</div>
                )}
              </div>
            );
          });
        })}

        {/* Hover preview ghost */}
        {hoverCell && (() => {
          const dayIdx = days.indexOf(hoverCell.day);
          if (dayIdx < 0) return null;
          const top = headerHeight + ((hoverCell.startMin - gridStart) / SLOT_MIN) * SLOT_PX;
          const height = (30 / SLOT_MIN) * SLOT_PX - 2;
          const left = `calc(60px + ${dayIdx} * (100% - 60px) / ${days.length})`;
          const width = `calc((100% - 60px) / ${days.length} - 4px)`;
          return (
            <div className="sched-event ghost" style={{ position: "absolute", top, height, left, width }}>
              <div className="ev-time">{minToTime(hoverCell.startMin)}</div>
              <div className="ev-pt">+ Book here</div>
            </div>
          );
        })()}

        {/* Now-line (only on today, within business hours) */}
        {(() => {
          const dayIdx = days.indexOf(todayIdx);
          if (dayIdx < 0) return null;
          if (nowMin < gridStart || nowMin > gridEnd) return null;
          const top = headerHeight + ((nowMin - gridStart) / SLOT_MIN) * SLOT_PX;
          const left = `calc(60px + ${dayIdx} * (100% - 60px) / ${days.length})`;
          const width = `calc((100% - 60px) / ${days.length})`;
          return (
            <div style={{ position: "absolute", top, left, width, height: 0, borderTop: "1.5px solid var(--danger)", zIndex: 5, pointerEvents: "none" }}>
              <div style={{ position: "absolute", left: -5, top: -5, width: 9, height: 9, borderRadius: "50%", background: "var(--danger)" }}/>
              <div style={{ position: "absolute", right: 4, top: -18, fontSize: 10, fontWeight: 600, color: "var(--danger)", fontFamily: "var(--font-mono)" }}>
                {String(now.getHours()).padStart(2,"0")}:{String(now.getMinutes()).padStart(2,"0")}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

const headerHeight = 37; // matches .sched-hd padding-y
const now = new Date();

// Column layout: detect overlaps and place events side by side
function layoutOverlaps(dayAppts) {
  const sorted = [...dayAppts].sort((a,b) => a.startMin - b.startMin);
  const out = [];
  const activeCols = []; // [{endMin, col}]
  const groups = [];
  let group = [];
  let groupEnd = 0;

  for (const a of sorted) {
    if (group.length === 0 || a.startMin < groupEnd) {
      group.push(a);
      groupEnd = Math.max(groupEnd, a.startMin + a.dur);
    } else {
      groups.push(group);
      group = [a];
      groupEnd = a.startMin + a.dur;
    }
  }
  if (group.length) groups.push(group);

  for (const g of groups) {
    // Greedy column assignment
    const cols = [];
    for (const a of g) {
      let placed = false;
      for (let i = 0; i < cols.length; i++) {
        if (cols[i] <= a.startMin) {
          out.push({ ...a, _col: i, _colCount: 0 });
          cols[i] = a.startMin + a.dur;
          placed = true;
          break;
        }
      }
      if (!placed) {
        out.push({ ...a, _col: cols.length, _colCount: 0 });
        cols.push(a.startMin + a.dur);
      }
    }
    // fill colCount for this group
    const start = out.length - g.length;
    for (let i = start; i < out.length; i++) out[i]._colCount = cols.length;
  }
  return out;
}

// ───────────────────── BOOKING MODAL with live conflict detection ─────────────────────
function BookingModal({ draft, setDraft, allAppts, onCommit, onCancel }) {
  // Live validation results
  const validations = useMemo(() => {
    const v = [];
    // 1. Business hours
    if (draft.startMin < BUSINESS_START || draft.startMin + draft.dur > BUSINESS_END) {
      v.push({ kind: "danger", key: "hours", title: "Outside business hours",
               body: `Appointments must fall between 09:00 and 17:00. This slot ${minToTime(draft.startMin)}–${minToTime(draft.startMin + draft.dur)} ${draft.startMin < BUSINESS_START ? "starts too early" : "ends too late"}.` });
    }
    // 2. Doctor double-booking
    const docConflicts = allAppts.filter(a =>
      a.doctorId === draft.doctorId &&
      a.day === draft.day &&
      overlaps(a.startMin, a.dur, draft.startMin, draft.dur)
    );
    if (docConflicts.length) {
      const c = docConflicts[0];
      const pt = PATIENTS.find(p => p.id === c.patientId);
      v.push({ kind: "danger", key: "doc", title: "Doctor already booked",
               body: `Dr. ${DOCTORS.find(d => d.id === c.doctorId)?.name.replace("Dr. ","")} has ${pt?.name} at ${minToTime(c.startMin)}–${minToTime(c.startMin + c.dur)}.` });
    }
    // 3. Patient already has appointment that day at same time
    if (draft.patientId) {
      const ptConflicts = allAppts.filter(a =>
        a.patientId === draft.patientId &&
        a.day === draft.day &&
        overlaps(a.startMin, a.dur, draft.startMin, draft.dur)
      );
      if (ptConflicts.length) {
        const c = ptConflicts[0];
        v.push({ kind: "warn", key: "pt", title: "Patient conflict",
                 body: `${PATIENTS.find(p => p.id === draft.patientId)?.name} already has an appointment at ${minToTime(c.startMin)}.` });
      }
    }
    // 4. Lunch window 12:00-13:00 soft warning
    if (draft.startMin < 4*60 && draft.startMin + draft.dur > 3*60) {
      v.push({ kind: "warn", key: "lunch", title: "Overlaps lunch break",
               body: `Doctor's lunch break is 12:00–13:00. Consider adjusting.` });
    }
    // 5. Success ok if no errors and required fields filled
    if (!v.length && draft.patientId) {
      v.push({ kind: "ok", key: "ok", title: "No conflicts — slot is available",
               body: `${minToTime(draft.startMin)}–${minToTime(draft.startMin + draft.dur)} with ${DOCTORS.find(d => d.id === draft.doctorId)?.name}.` });
    }
    return v;
  }, [draft, allAppts]);

  const hasBlocker = validations.some(v => v.kind === "danger");
  const canSubmit = draft.patientId && !hasBlocker;

  const doctor = DOCTORS.find(d => d.id === draft.doctorId);
  const dept = DEPARTMENTS.find(d => d.id === doctor?.dept);
  const day = dayLabel(draft.day);

  // Filter suggested slots (same day, same doctor, not conflicting)
  const suggestions = useMemo(() => {
    const out = [];
    for (let m = BUSINESS_START; m <= BUSINESS_END - draft.dur; m += 30) {
      const conflict = allAppts.some(a =>
        a.doctorId === draft.doctorId && a.day === draft.day &&
        overlaps(a.startMin, a.dur, m, draft.dur)
      );
      if (!conflict && Math.abs(m - draft.startMin) < 180 && m !== draft.startMin) {
        out.push(m);
      }
      if (out.length >= 4) break;
    }
    return out;
  }, [draft, allAppts]);

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Book appointment</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              {day.name}, {day.month} {day.num} · {minToTime(draft.startMin)}–{minToTime(draft.startMin + draft.dur)}
            </div>
          </div>
          <button className="icon-btn" onClick={onCancel}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="field">
              <label>Patient <span className="req">*</span></label>
              <select className="select" value={draft.patientId} onChange={e => setDraft({...draft, patientId: e.target.value})}>
                <option value="">Select patient…</option>
                {PATIENTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} · {p.mrn} · Age {ageFromDob(p.dob)}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Doctor</label>
              <select className="select" value={draft.doctorId} onChange={e => setDraft({...draft, doctorId: e.target.value})}>
                {DOCTORS.map(d => (
                  <option key={d.id} value={d.id}>{d.name} — {DEPARTMENTS.find(x => x.id === d.dept).name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Type</label>
              <select className="select" value={draft.type} onChange={e => setDraft({...draft, type: e.target.value})}>
                {Object.entries(APPT_TYPES).map(([k,v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Duration</label>
              <select className="select" value={draft.dur} onChange={e => setDraft({...draft, dur: +e.target.value})}>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
            <div className="field">
              <label>Start time</label>
              <select className="select" value={draft.startMin} onChange={e => setDraft({...draft, startMin: +e.target.value})}>
                {Array.from({length: (BUSINESS_END - BUSINESS_START)/15 + 1}, (_,i) => BUSINESS_START + i*15).map(m => (
                  <option key={m} value={m}>{minToTime(m)}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Day</label>
              <select className="select" value={draft.day} onChange={e => setDraft({...draft, day: +e.target.value})}>
                {[0,1,2,3,4].map(d => {
                  const l = dayLabel(d);
                  return <option key={d} value={d}>{l.name}, {l.month} {l.num}</option>;
                })}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginTop: 14 }}>
            <label>Notes</label>
            <textarea className="input" placeholder="Reason for visit, prior symptoms, etc."
              value={draft.notes} onChange={e => setDraft({...draft, notes: e.target.value})}/>
          </div>

          {/* Doctor info pill */}
          {doctor && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: 10, borderRadius: 8, background: "var(--surface-2)",
              border: "1px solid var(--hairline)", marginTop: 14,
            }}>
              <Avatar name={doctor.name} hue={doctor.hue} size={32}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{doctor.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{dept?.name} · {doctor.email}</div>
              </div>
              <Badge variant="accent">{allAppts.filter(a => a.doctorId === doctor.id && a.day === draft.day).length} on {day.name}</Badge>
            </div>
          )}

          {/* Live validations */}
          {validations.length > 0 && (
            <div className="stack" style={{ marginTop: 14, gap: 8 }}>
              {validations.map(v => (
                <div key={v.key} className={`alert ${v.kind}`}>
                  <span className="alert-ico">
                    <Icon name={v.kind === "ok" ? "check" : v.kind === "warn" ? "warn" : "alert"} size={16}/>
                  </span>
                  <div>
                    <div className="alert-title">{v.title}</div>
                    <div>{v.body}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions when there's a conflict */}
          {hasBlocker && suggestions.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Suggested available slots
              </div>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {suggestions.map(m => (
                  <button key={m} className="btn sm" onClick={() => setDraft({...draft, startMin: m})}>
                    <Icon name="clock" size={12}/> {minToTime(m)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <span style={{ flex: 1, fontSize: 12, color: "var(--muted)" }}>
            {hasBlocker ? "Resolve conflicts to book" : canSubmit ? "Ready to book" : "Select a patient to continue"}
          </span>
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn primary" disabled={!canSubmit} onClick={() => onCommit(draft)}>
            <Icon name="check" size={13}/> Book appointment
          </button>
        </div>
      </div>
    </div>
  );
}

function AppointmentDetailModal({ appt, onClose, onCheckIn, onReschedule }) {
  const pt = PATIENTS.find(p => p.id === appt.patientId);
  const doc = DOCTORS.find(d => d.id === appt.doctorId);
  const dept = DEPARTMENTS.find(d => d.id === doc?.dept);
  const day = dayLabel(appt.day);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{APPT_TYPES[appt.type]?.label}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }} className="mono">{appt.id}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body">
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
            <Avatar name={pt?.name} hue={hueOf(pt?.id || "")} size={44}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{pt?.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{pt?.mrn} · Age {ageFromDob(pt?.dob || "2000-01-01")} · {pt?.gender === "F" ? "Female" : "Male"}</div>
            </div>
            {pt?.allergies.length > 0 && (
              <Badge variant="danger" dot>{pt.allergies.length} allergies</Badge>
            )}
          </div>
          <dl className="deffn">
            <dt>Day</dt><dd>{day.name}, {day.month} {day.num}</dd>
            <dt>Time</dt><dd className="mono">{minToTime(appt.startMin)}–{minToTime(appt.startMin + appt.dur)} ({appt.dur} min)</dd>
            <dt>Doctor</dt><dd>{doc?.name} · {dept?.name}</dd>
            <dt>Room</dt><dd className="mono">{appt.room}</dd>
            <dt>Notes</dt><dd>{appt.notes}</dd>
          </dl>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn" onClick={onReschedule}><Icon name="edit" size={13}/> Reschedule</button>
          <button className="btn primary" onClick={onCheckIn}>
            <Icon name="check" size={13}/> Check in
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Appointments });
