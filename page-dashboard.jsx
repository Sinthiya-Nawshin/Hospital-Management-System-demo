// page-dashboard.jsx

function Dashboard({ role, setPage, pushToast, onOpenScenarios }) {
  const r = ROLES[role];

  const todayAppts = APPOINTMENTS.filter(a => a.day === 2);
  const admittedCount = ROOMS.filter(x => x.patientId).length;
  const availableRooms = ROOMS.filter(x => !x.patientId && x.cleanStatus === "ok").length;
  const pendingBills = BILLS.filter(b => b.status !== "paid").length;
  const pendingTotal = BILLS.filter(b => b.status !== "paid").reduce((s,b) => s + (b.amount - (b.paid || 0)), 0);
  const lowStock = MEDICATIONS.filter(m => m.stock < m.reorder).length;
  const availAmb = AMBULANCES.filter(a => a.status === "available").length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  // Role-specific KPIs
  const kpis = {
    receptionist: [
      { label: "Today's appointments", value: todayAppts.length, unit: "", delta: "+3", deltaKind: "up", spark: [6,5,7,8,6,9,11,10,12] },
      { label: "Open rooms",           value: availableRooms,    unit: "/ "+ROOMS.length, delta: "–2", deltaKind: "down", spark: [10,9,8,9,8,7,8,6,6] },
      { label: "Walk-ins today",       value: 7,                 unit: "", delta: "+2", deltaKind: "up", spark: [3,4,3,5,4,6,5,7,7] },
      { label: "Ambulances ready",     value: availAmb,          unit: "/ "+AMBULANCES.length, delta: "", deltaKind: "", spark: [4,4,3,4,4,3,3,4,4] },
    ],
    doctor: [
      { label: "Your patients today",  value: todayAppts.filter(a => a.doctorId === "D-1042").length, unit: "", delta: "+1", deltaKind: "up", spark: [4,5,4,6,5,6,7,6,7] },
      { label: "Unsigned notes",       value: 3, unit: "", delta: "", deltaKind: "", spark: [5,4,4,3,3,3,3,3,3] },
      { label: "Pending prescriptions",value: 2, unit: "", delta: "", deltaKind: "", spark: [1,2,2,2,3,3,2,2,2] },
      { label: "Avg. visit",           value: "14", unit: "min", delta: "–1m", deltaKind: "up", spark: [17,16,16,15,15,14,15,14,14] },
    ],
    billing: [
      { label: "Pending bills",        value: pendingBills, unit: "", delta: "+2", deltaKind: "down", spark: [3,3,4,4,5,4,4,5,5] },
      { label: "Outstanding",          value: "$" + (pendingTotal/1000).toFixed(1) + "k", unit: "", delta: "+$840", deltaKind: "down", spark: [6,7,8,8,9,10,11,10,12] },
      { label: "Collected this week",  value: "$4.2k", unit: "", delta: "+12%", deltaKind: "up", spark: [2,3,4,3,5,6,5,7,8] },
      { label: "Discharges blocked",   value: 3, unit: "", delta: "", deltaKind: "", spark: [2,3,3,3,4,3,3,3,3] },
    ],
    admin: [
      { label: "Active patients",      value: PATIENTS.filter(p => p.status !== "discharged").length, unit: "", delta: "+4", deltaKind: "up", spark: [8,9,10,11,10,12,11,13,14] },
      { label: "Admitted",             value: admittedCount, unit: "", delta: "+1", deltaKind: "up", spark: [3,4,4,5,5,4,5,5,5] },
      { label: "Revenue today",        value: "$12.8k", unit: "", delta: "+8%", deltaKind: "up", spark: [6,7,8,9,8,10,11,12,13] },
      { label: "Low stock items",      value: lowStock, unit: "", delta: "+1", deltaKind: "down", spark: [2,2,2,3,3,3,3,4,4] },
    ],
  };
  const cards = kpis[role] || kpis.admin;

  const roleActions = {
    receptionist: [
      { label: "Register patient", icon: "plus", to: "patients" },
      { label: "Book appointment", icon: "calendar", to: "appointments" },
      { label: "Admit patient", icon: "bed", to: "admissions" },
    ],
    doctor: [
      { label: "Start consultation", icon: "stethoscope", to: "appointments" },
      { label: "Write prescription", icon: "pill", to: "prescriptions" },
      { label: "Review admissions", icon: "bed", to: "admissions" },
    ],
    billing: [
      { label: "Open pending bills", icon: "billing", to: "billing" },
      { label: "Clear discharge", icon: "check", to: "billing" },
      { label: "Generate invoice", icon: "plus", to: "billing" },
    ],
    admin: [
      { label: "View all patients", icon: "patients", to: "patients" },
      { label: "Appointment calendar", icon: "calendar", to: "appointments" },
      { label: "Pharmacy", icon: "vial", to: "pharmacy" },
    ],
  };
  const actions = roleActions[role] || roleActions.admin;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {r.name.split(" ")[0]}.</h1>
          <p className="page-subtitle">
            {role === "doctor" ? "You have 4 appointments scheduled today, next in 18 minutes." :
             role === "receptionist" ? "Front desk is steady. 7 walk-ins so far this morning." :
             role === "billing" ? `${pendingBills} bills need attention — ${currency(pendingTotal)} outstanding.` :
             `Hospital at ${Math.round(admittedCount / ROOMS.length * 100)}% capacity. Systems nominal.`}
          </p>
        </div>
        <div className="page-actions">
          {actions.map((a,i) => (
            <button key={i} className={`btn ${i === 0 ? "primary" : ""}`} onClick={() => setPage(a.to)}>
              <Icon name={a.icon} size={14}/> {a.label}
            </button>
          ))}
        </div>
      </div>

      <div
        onClick={onOpenScenarios}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px", marginBottom: 16,
          background: "linear-gradient(90deg, var(--accent-soft), transparent 80%)",
          border: "1px solid oklch(0.88 0.04 245)",
          borderRadius: 10, cursor: "pointer",
          transition: "transform .12s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "none"}
      >
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent)", color: "white", display: "grid", placeItems: "center" }}>
          <Icon name="sparkle" size={16}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>Try a demo scenario</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Jump into a pre-scripted booking conflict, allergy block, or discharge-gate situation.</div>
        </div>
        <Icon name="chevRight" size={14} style={{ color: "var(--accent-soft-ink)" }}/>
      </div>

      <div className="kpi-grid">
        {cards.map((k,i) => (
          <div className="kpi" key={i}>
            <div className="kpi-label">
              <span>{k.label}</span>
            </div>
            <div className="kpi-value">
              {k.value}{k.unit && <span className="unit">{k.unit}</span>}
            </div>
            {k.delta && (
              <span className={`kpi-delta ${k.deltaKind}`}>
                {k.deltaKind === "up" ? "↑" : "↓"} {k.delta}
              </span>
            )}
            <div className="kpi-spark"><Spark points={k.spark}/></div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Today's schedule</div>
              <div className="card-subtitle">{todayAppts.length} appointments · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
            </div>
            <button className="btn sm ghost" onClick={() => setPage("appointments")}>
              Open calendar <Icon name="chevRight" size={12}/>
            </button>
          </div>
          <div className="card-body flush">
            <TodayTimeline appts={todayAppts} onPick={() => setPage("appointments")}/>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Activity</div>
            <button className="icon-btn"><Icon name="more" size={14}/></button>
          </div>
          <div className="card-body" style={{ padding: "4px 16px 16px" }}>
            {ACTIVITY.slice(0,7).map((a,i) => (
              <div className="activity-row" key={i}>
                <div className={`dot-ico ${a.kind}`}/>
                <div className="activity-txt">
                  <div>{a.text}</div>
                  <div className="activity-meta">{a.t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-grid-3">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Ward occupancy</div>
            <Badge variant="accent">{admittedCount}/{ROOMS.length}</Badge>
          </div>
          <div className="card-body">
            <WardBars/>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Pending bills</div>
            <button className="btn sm ghost" onClick={() => setPage("billing")}>View all <Icon name="chevRight" size={12}/></button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="tbl">
              <tbody>
                {BILLS.filter(b => b.status !== "paid").slice(0,4).map(b => {
                  const pt = PATIENTS.find(p => p.id === b.patientId);
                  return (
                    <tr key={b.id}>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ fontWeight: 500, color: "var(--ink)" }}>{pt?.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--muted)" }} className="mono">{b.id}</div>
                      </td>
                      <td className="right num" style={{ paddingRight: 14 }}>
                        {currency(b.amount - (b.paid||0))}
                        <div style={{ marginTop: 3 }}>
                          {b.status === "partial"
                            ? <Badge variant="warn" dot>Partial</Badge>
                            : <Badge variant="danger" dot>Pending</Badge>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Inventory alerts</div>
            <Badge variant="warn">{lowStock} low</Badge>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {MEDICATIONS.filter(m => m.stock < m.reorder).slice(0,4).map(m => {
              const pct = Math.min(100, Math.round(m.stock / m.reorder * 100));
              const cls = pct < 30 ? "critical" : pct < 60 ? "low" : "";
              return (
                <div key={m.id} style={{ padding: "10px 14px", borderBottom: "1px solid var(--hairline)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</span>
                    <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{m.stock} / {m.reorder}</span>
                  </div>
                  <div className="stockbar"><span className={cls} style={{ width: pct + "%" }}/></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TodayTimeline({ appts, onPick }) {
  const sorted = [...appts].sort((a,b) => a.startMin - b.startMin);
  const nowMin = (new Date().getHours() - 9) * 60 + new Date().getMinutes();
  return (
    <div style={{ padding: "6px 0" }}>
      {sorted.map((a, i) => {
        const doc = DOCTORS.find(d => d.id === a.doctorId);
        const pt = PATIENTS.find(p => p.id === a.patientId);
        const isPast = a.startMin + a.dur < nowMin;
        const isNow = a.startMin <= nowMin && nowMin < a.startMin + a.dur;
        return (
          <div key={a.id} onClick={onPick} style={{
            display: "grid", gridTemplateColumns: "64px 12px 1fr auto",
            gap: 10, padding: "8px 16px", cursor: "pointer",
            alignItems: "center",
            opacity: isPast ? 0.45 : 1,
          }}>
            <div className="mono" style={{ fontSize: 12, color: isNow ? "var(--danger-soft-ink)" : "var(--muted)", fontWeight: 600 }}>
              {minToTime(a.startMin)}
            </div>
            <div style={{
              width: 3, height: "100%",
              background: APPT_TYPES[a.type].cls.includes("followup") ? "var(--violet)" :
                           APPT_TYPES[a.type].cls.includes("procedure") ? "var(--warn)" :
                           APPT_TYPES[a.type].cls.includes("checkup") ? "var(--ok)" :
                           APPT_TYPES[a.type].cls.includes("urgent") ? "var(--danger)" : "var(--accent)",
              borderRadius: 2,
            }}/>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{pt?.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
                {APPT_TYPES[a.type].label} · {doc?.name.replace("Dr. ","Dr. ")} · {a.room}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {isNow && <Badge variant="danger" dot>Now</Badge>}
              {!isNow && !isPast && <Badge variant="outline">In {a.startMin - nowMin}m</Badge>}
              {isPast && <Badge variant="outline">Done</Badge>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WardBars() {
  const byWard = {};
  ROOMS.forEach(r => {
    if (!byWard[r.ward]) byWard[r.ward] = { total: 0, occ: 0 };
    byWard[r.ward].total++;
    if (r.patientId) byWard[r.ward].occ++;
  });
  return (
    <div className="stack" style={{ gap: 14 }}>
      {Object.entries(byWard).map(([ward, v]) => {
        const pct = Math.round(v.occ / v.total * 100);
        return (
          <div key={ward}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)" }}>{ward}</span>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--muted)" }}>{v.occ} / {v.total}</span>
            </div>
            <div className="stockbar" style={{ height: 8 }}>
              <span style={{ width: pct + "%", background: pct > 80 ? "var(--danger)" : pct > 60 ? "var(--warn)" : "var(--accent)" }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { Dashboard });
