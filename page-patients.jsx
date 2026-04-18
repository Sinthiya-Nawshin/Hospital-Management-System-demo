// page-patients.jsx — registry + detail

function Patients({ role, pushToast }) {
  const [selected, setSelected] = useState("P-00412");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const visible = PATIENTS.filter(p => {
    if (filter !== "all" && p.status !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    }
    return true;
  });

  const patient = PATIENTS.find(p => p.id === selected);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">{PATIENTS.length} registered · {PATIENTS.filter(p => p.status === "admitted").length} currently admitted</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download" size={13}/> Export</button>
          <button className="btn primary" onClick={() => pushToast("Register-patient wizard would open here", "")}>
            <Icon name="plus" size={13}/> Register patient
          </button>
        </div>
      </div>

      <div className="pt-detail">
        {/* LEFT — list */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)", position: "sticky", top: 20 }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--hairline)" }}>
            <div className="topbar-search" style={{ maxWidth: "none", marginLeft: 0 }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)", pointerEvents: "none" }}>
                <Icon name="search" size={14}/>
              </span>
              <input placeholder="Search name, MRN…" value={query} onChange={e => setQuery(e.target.value)}/>
            </div>
            <div className="segmented" style={{ marginTop: 8, width: "100%", display: "flex" }}>
              {[
                { k: "all",         l: "All" },
                { k: "admitted",    l: "Admitted" },
                { k: "outpatient",  l: "Outpatient" },
                { k: "discharged",  l: "Discharged" },
              ].map(t => (
                <button key={t.k} className={filter === t.k ? "on" : ""} onClick={() => setFilter(t.k)} style={{ flex: 1 }}>{t.l}</button>
              ))}
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {visible.map(p => (
              <button key={p.id} onClick={() => setSelected(p.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "10px 12px",
                  background: p.id === selected ? "var(--accent-soft)" : "transparent",
                  border: "none", borderBottom: "1px solid var(--hairline)",
                  textAlign: "left", cursor: "pointer",
                }}>
                <Avatar name={p.name} hue={hueOf(p.id)} size={30}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)" }} className="mono">{p.mrn} · {ageFromDob(p.dob)}{p.gender}</div>
                </div>
                {p.status === "admitted" && <Badge variant="accent" dot>Adm</Badge>}
                {p.status === "discharged" && <Badge variant="outline">Dis</Badge>}
                {p.allergies.length > 0 && <Icon name="warn" size={12} style={{ color: "var(--warn-soft-ink)" }}/>}
              </button>
            ))}
            {visible.length === 0 && <div className="empty">No patients match your filters.</div>}
          </div>
        </div>

        {/* RIGHT — detail */}
        {patient ? <PatientDetail patient={patient} pushToast={pushToast}/> : <div className="empty">Select a patient</div>}
      </div>
    </div>
  );
}

function PatientDetail({ patient, pushToast }) {
  const [tab, setTab] = useState("overview");
  const bills = BILLS.filter(b => b.patientId === patient.id);
  const upcoming = APPOINTMENTS.filter(a => a.patientId === patient.id);
  const outstanding = bills.filter(b => b.status !== "paid").reduce((s,b) => s + (b.amount - (b.paid||0)), 0);

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="pt-hero">
        <Avatar name={patient.name} hue={hueOf(patient.id)} size={56}/>
        <div style={{ flex: 1 }}>
          <div className="pt-name">{patient.name}</div>
          <div className="pt-meta">
            {patient.mrn} · Age {ageFromDob(patient.dob)} · {patient.gender === "F" ? "Female" : "Male"} · Blood {patient.bloodType}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {patient.status === "admitted" && <Badge variant="accent" dot>Admitted</Badge>}
            {patient.status === "outpatient" && <Badge variant="outline">Outpatient</Badge>}
            {patient.status === "discharged" && <Badge variant="ok" dot>Discharged</Badge>}
            {patient.allergies.map(a => (
              <Badge key={a} variant="danger" dot>{a}</Badge>
            ))}
            {patient.allergies.length === 0 && <Badge variant="ok" dot>No known allergies</Badge>}
            {outstanding > 0 && <Badge variant="warn">Balance: {currency(outstanding)}</Badge>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn sm"><Icon name="edit" size={12}/> Edit</button>
          <button className="btn sm primary"><Icon name="calendar" size={12}/> Schedule</button>
        </div>
      </div>

      <div className="tabs">
        {["overview","history","prescriptions","admissions","bills"].map(t => (
          <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "bills" && outstanding > 0 && <span className="badge danger" style={{ marginLeft: 6 }}>{bills.filter(b => b.status !== "paid").length}</span>}
          </button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">Demographics</div></div>
              <div className="card-body">
                <dl className="deffn">
                  <dt>Patient ID</dt><dd className="mono">{patient.id}</dd>
                  <dt>MRN</dt><dd className="mono">{patient.mrn}</dd>
                  <dt>Date of birth</dt><dd>{new Date(patient.dob).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</dd>
                  <dt>Gender</dt><dd>{patient.gender === "F" ? "Female" : "Male"}</dd>
                  <dt>Blood type</dt><dd>{patient.bloodType}</dd>
                  <dt>Phone</dt><dd>{patient.phone}</dd>
                  <dt>Insurer</dt><dd>{patient.insurer}</dd>
                </dl>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Allergies & alerts</div></div>
              <div className="card-body">
                {patient.allergies.length === 0 ? (
                  <div className="alert ok">
                    <Icon name="check" size={16} className="alert-ico"/>
                    <div>
                      <div className="alert-title">No known allergies</div>
                      <div>Prescription safety checks will pass without warnings.</div>
                    </div>
                  </div>
                ) : (
                  <div className="stack" style={{ gap: 8 }}>
                    {patient.allergies.map(a => (
                      <div key={a} className="alert danger">
                        <Icon name="alert" size={16} className="alert-ico"/>
                        <div>
                          <div className="alert-title">{a}</div>
                          <div>Prescriptions containing this will be blocked automatically.</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="card" style={{ gridColumn: "1 / -1" }}>
              <div className="card-header">
                <div className="card-title">Upcoming appointments</div>
                <Badge variant="accent">{upcoming.length}</Badge>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {upcoming.length === 0 && <div className="empty">No upcoming appointments.</div>}
                {upcoming.length > 0 && (
                  <table className="tbl">
                    <thead><tr><th>Date</th><th>Time</th><th>Doctor</th><th>Type</th><th>Room</th><th>Notes</th></tr></thead>
                    <tbody>
                      {upcoming.map(a => {
                        const doc = DOCTORS.find(d => d.id === a.doctorId);
                        const d = new Date(WEEK_START.getTime() + a.day*86400000);
                        return (
                          <tr key={a.id}>
                            <td>{d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</td>
                            <td className="mono">{minToTime(a.startMin)}</td>
                            <td>{doc?.name}</td>
                            <td><Badge variant={a.type === "urgent" ? "danger" : a.type === "procedure" ? "warn" : "accent"}>{APPT_TYPES[a.type].label}</Badge></td>
                            <td className="mono">{a.room}</td>
                            <td className="muted-cell">{a.notes}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "bills" && (
          <div className="stack" style={{ gap: 10 }}>
            {bills.length === 0 && <div className="empty">No bills on file.</div>}
            {bills.map(b => (
              <div className="card" key={b.id}>
                <div className="card-header">
                  <div>
                    <div className="card-title">Invoice <span className="mono" style={{ color: "var(--muted)", fontWeight: 450 }}>{b.id}</span></div>
                    <div className="card-subtitle">{new Date(b.date).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }} className="mono">{currency(b.amount)}</div>
                    {b.status === "paid" && <Badge variant="ok" dot>Paid</Badge>}
                    {b.status === "partial" && <Badge variant="warn" dot>Partial — {currency(b.paid)} paid</Badge>}
                    {b.status === "pending" && <Badge variant="danger" dot>Pending</Badge>}
                  </div>
                </div>
                <table className="tbl"><tbody>
                  {b.items.map((it,i) => (
                    <tr key={i}><td>{it.label}</td><td className="right num">{currency(it.amount)}</td></tr>
                  ))}
                </tbody></table>
              </div>
            ))}
          </div>
        )}

        {tab === "history" && (
          <div className="empty">Medical history timeline — placeholder for drug reactions, prior procedures, lab results.</div>
        )}
        {tab === "prescriptions" && (
          <div className="empty">Prescription history — prior meds, dosages, prescribing doctor.</div>
        )}
        {tab === "admissions" && (
          <div className="empty">Admission records — ward, dates, discharging physician.</div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Patients });
