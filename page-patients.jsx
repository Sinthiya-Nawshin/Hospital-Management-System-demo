// page-patients.jsx — registry + detail

function Patients({ role, pushToast }) {
  const [selected, setSelected] = useState("P-00412");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

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
          <button className="btn" onClick={() => pushToast(`Exported ${visible.length} patients to CSV`, "ok")}><Icon name="download" size={13}/> Export</button>
          <button className="btn primary" onClick={() => setRegisterOpen(true)}>
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
        {patient ? <PatientDetail patient={patient} pushToast={pushToast} onEdit={() => setEditOpen(true)} onSchedule={() => setScheduleOpen(true)}/> : <div className="empty">Select a patient</div>}
      </div>

      {registerOpen && <RegisterPatientModal onClose={() => setRegisterOpen(false)} pushToast={pushToast}/>}
      {editOpen && patient && <EditPatientModal patient={patient} onClose={() => setEditOpen(false)} pushToast={pushToast}/>}
      {scheduleOpen && patient && <QuickScheduleModal patient={patient} onClose={() => setScheduleOpen(false)} pushToast={pushToast}/>}
    </div>
  );
}

function PatientDetail({ patient, pushToast, onEdit, onSchedule }) {
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
          <button className="btn sm" onClick={onEdit}><Icon name="edit" size={12}/> Edit</button>
          <button className="btn sm primary" onClick={onSchedule}><Icon name="calendar" size={12}/> Schedule</button>
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

// ─── Register Patient Modal ───────────────────────────────────────

function RegisterPatientModal({ onClose, pushToast }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    firstName: "", lastName: "", dob: "", gender: "F",
    phone: "", email: "",
    bloodType: "", insurer: "", policyNum: "",
    allergies: [], emergencyName: "", emergencyPhone: "",
    consent: false,
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const toggleAllergy = (a) => setData(d => ({ ...d, allergies: d.allergies.includes(a) ? d.allergies.filter(x => x !== a) : [...d.allergies, a] }));

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!data.firstName.trim()) e.firstName = "Required";
      if (!data.lastName.trim()) e.lastName = "Required";
      if (!data.dob) e.dob = "Required";
      else if (new Date(data.dob) > new Date()) e.dob = "Cannot be in the future";
      if (!data.phone.trim()) e.phone = "Required";
      else if (!/^[\d\s\-()+]{7,}$/.test(data.phone)) e.phone = "Invalid format";
      if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) e.email = "Invalid email";
    }
    if (s === 2) {
      if (!data.bloodType) e.bloodType = "Required — used for emergency transfusion";
    }
    if (s === 3) {
      if (!data.emergencyName.trim()) e.emergencyName = "Required";
      if (!data.emergencyPhone.trim()) e.emergencyPhone = "Required";
      if (!data.consent) e.consent = "You must acknowledge the consent notice";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const submit = () => {
    if (!validateStep(3)) return;
    const newMrn = "MRN-" + String(Math.floor(100000 + Math.random() * 899999));
    pushToast(`Patient registered — ${data.firstName} ${data.lastName} (${newMrn})`, "ok");
    onClose();
  };

  const age = data.dob ? ageFromDob(data.dob) : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-soft-ink)" }}>
              Step {step} of 3
            </div>
            <div className="modal-title">
              {step === 1 && "Patient identity"}
              {step === 2 && "Medical information"}
              {step === 3 && "Emergency contact & consent"}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>

        {/* Step indicator */}
        <div style={{ padding: "12px 20px 0", display: "flex", gap: 4 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: s <= step ? "var(--accent)" : "var(--hairline-strong)",
              transition: "background .2s"
            }}/>
          ))}
        </div>

        <div className="modal-body" style={{ padding: 20 }}>
          {step === 1 && (
            <div className="stack" style={{ gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div className="field">
                  <label>First name <span className="req">*</span></label>
                  <input className={"input" + (errors.firstName ? " input-error" : "")} value={data.firstName} onChange={e => set("firstName", e.target.value)} autoFocus/>
                  {errors.firstName && <div className="field-err"><Icon name="alert" size={11}/> {errors.firstName}</div>}
                </div>
                <div className="field">
                  <label>Last name <span className="req">*</span></label>
                  <input className={"input" + (errors.lastName ? " input-error" : "")} value={data.lastName} onChange={e => set("lastName", e.target.value)}/>
                  {errors.lastName && <div className="field-err"><Icon name="alert" size={11}/> {errors.lastName}</div>}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div className="field">
                  <label>Date of birth <span className="req">*</span></label>
                  <input className={"input" + (errors.dob ? " input-error" : "")} type="date" value={data.dob} onChange={e => set("dob", e.target.value)}/>
                  {errors.dob && <div className="field-err"><Icon name="alert" size={11}/> {errors.dob}</div>}
                  {age !== null && !errors.dob && <div className="field-hint">Age: {age} years</div>}
                </div>
                <div className="field">
                  <label>Gender</label>
                  <div className="segmented" style={{ width: "100%", display: "flex" }}>
                    {["F","M","X"].map(g => (
                      <button key={g} type="button" className={data.gender === g ? "on" : ""} onClick={() => set("gender", g)} style={{ flex: 1 }}>
                        {g === "F" ? "Female" : g === "M" ? "Male" : "Other"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="field">
                <label>Phone <span className="req">*</span></label>
                <input className={"input" + (errors.phone ? " input-error" : "")} value={data.phone} onChange={e => set("phone", e.target.value)} placeholder="(555) 123-4567"/>
                {errors.phone && <div className="field-err"><Icon name="alert" size={11}/> {errors.phone}</div>}
              </div>
              <div className="field">
                <label>Email</label>
                <input className={"input" + (errors.email ? " input-error" : "")} value={data.email} onChange={e => set("email", e.target.value)} placeholder="optional"/>
                {errors.email && <div className="field-err"><Icon name="alert" size={11}/> {errors.email}</div>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="stack" style={{ gap: 12 }}>
              <div className="field">
                <label>Blood type <span className="req">*</span></label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                  {["O+","O-","A+","A-","B+","B-","AB+","AB-"].map(bt => (
                    <button key={bt} type="button" className={"btn" + (data.bloodType === bt ? " primary" : "")} onClick={() => set("bloodType", bt)} style={{ justifyContent: "center" }}>
                      {bt}
                    </button>
                  ))}
                </div>
                {errors.bloodType && <div className="field-err"><Icon name="alert" size={11}/> {errors.bloodType}</div>}
              </div>
              <div className="field">
                <label>Known allergies</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["Penicillin","Sulfa","Aspirin","Latex","Iodine","Peanuts","Shellfish"].map(a => (
                    <button key={a} type="button" onClick={() => toggleAllergy(a)}
                      style={{
                        padding: "5px 10px", fontSize: 12, borderRadius: 14,
                        border: "1px solid " + (data.allergies.includes(a) ? "var(--danger)" : "var(--hairline-strong)"),
                        background: data.allergies.includes(a) ? "var(--danger-soft)" : "var(--surface)",
                        color: data.allergies.includes(a) ? "var(--danger-soft-ink)" : "var(--ink-2)",
                        cursor: "pointer", fontWeight: 500,
                      }}>
                      {data.allergies.includes(a) && "✓ "}{a}
                    </button>
                  ))}
                </div>
                {data.allergies.length > 0 && (
                  <div className="alert danger" style={{ marginTop: 10 }}>
                    <Icon name="alert" size={14} className="alert-ico"/>
                    <div>
                      <div className="alert-title">{data.allergies.length} {data.allergies.length === 1 ? "allergy" : "allergies"} recorded</div>
                      <div>Prescription orders containing these will be blocked automatically.</div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div className="field">
                  <label>Insurer</label>
                  <input className="input" value={data.insurer} onChange={e => set("insurer", e.target.value)} placeholder="e.g. Aetna, self-pay"/>
                </div>
                <div className="field">
                  <label>Policy number</label>
                  <input className="input" value={data.policyNum} onChange={e => set("policyNum", e.target.value)}/>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="stack" style={{ gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div className="field">
                  <label>Emergency contact name <span className="req">*</span></label>
                  <input className={"input" + (errors.emergencyName ? " input-error" : "")} value={data.emergencyName} onChange={e => set("emergencyName", e.target.value)}/>
                  {errors.emergencyName && <div className="field-err"><Icon name="alert" size={11}/> {errors.emergencyName}</div>}
                </div>
                <div className="field">
                  <label>Emergency phone <span className="req">*</span></label>
                  <input className={"input" + (errors.emergencyPhone ? " input-error" : "")} value={data.emergencyPhone} onChange={e => set("emergencyPhone", e.target.value)} placeholder="(555) 000-0000"/>
                  {errors.emergencyPhone && <div className="field-err"><Icon name="alert" size={11}/> {errors.emergencyPhone}</div>}
                </div>
              </div>

              <div className="card" style={{ background: "var(--surface-2)" }}>
                <div className="card-header"><div className="card-title">Review</div></div>
                <div className="card-body">
                  <dl className="deffn">
                    <dt>Name</dt><dd>{data.firstName} {data.lastName}</dd>
                    <dt>DOB</dt><dd>{data.dob || "—"} {age !== null && `(${age}y)`}</dd>
                    <dt>Phone</dt><dd>{data.phone}</dd>
                    <dt>Blood type</dt><dd>{data.bloodType}</dd>
                    <dt>Allergies</dt><dd>{data.allergies.length ? data.allergies.join(", ") : "None"}</dd>
                    <dt>Insurer</dt><dd>{data.insurer || "Self-pay"}</dd>
                  </dl>
                </div>
              </div>

              <label style={{ display: "flex", gap: 10, padding: 12, borderRadius: 8, background: data.consent ? "var(--ok-soft)" : "var(--surface-2)", border: "1px solid " + (errors.consent ? "var(--danger)" : "var(--hairline)"), cursor: "pointer" }}>
                <input type="checkbox" checked={data.consent} onChange={e => set("consent", e.target.checked)} style={{ marginTop: 2 }}/>
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.45 }}>
                  <strong>HIPAA consent acknowledged.</strong> Patient authorizes Meridian General to use and disclose protected health information for treatment, payment, and hospital operations.
                </div>
              </label>
              {errors.consent && <div className="field-err"><Icon name="alert" size={11}/> {errors.consent}</div>}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <div style={{ flex: 1 }}/>
          {step > 1 && <button className="btn" onClick={back}><Icon name="chevLeft" size={12}/> Back</button>}
          {step < 3 && <button className="btn primary" onClick={next}>Continue <Icon name="chevRight" size={12}/></button>}
          {step === 3 && <button className="btn primary" onClick={submit}><Icon name="check" size={13}/> Register patient</button>}
        </div>
      </div>
    </div>
  );
}

// ─── Edit Patient Modal ─────────────────────────────────────────

function EditPatientModal({ patient, onClose, pushToast }) {
  const [phone, setPhone] = useState(patient.phone);
  const [insurer, setInsurer] = useState(patient.insurer);
  const [allergies, setAllergies] = useState(patient.allergies);
  const [newAllergy, setNewAllergy] = useState("");

  const save = () => {
    pushToast(`Updated ${patient.name}'s record`, "ok");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Edit patient</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{patient.name} · {patient.mrn}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body" style={{ padding: 20 }}>
          <div className="stack" style={{ gap: 12 }}>
            <div className="field">
              <label>Phone</label>
              <input className="input" value={phone} onChange={e => setPhone(e.target.value)}/>
            </div>
            <div className="field">
              <label>Insurer</label>
              <input className="input" value={insurer} onChange={e => setInsurer(e.target.value)}/>
            </div>
            <div className="field">
              <label>Allergies</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {allergies.map(a => (
                  <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", fontSize: 12, borderRadius: 12, background: "var(--danger-soft)", color: "var(--danger-soft-ink)", fontWeight: 500 }}>
                    {a}
                    <button onClick={() => setAllergies(allergies.filter(x => x !== a))} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, display: "inline-flex" }}><Icon name="x" size={10}/></button>
                  </span>
                ))}
                {allergies.length === 0 && <span style={{ fontSize: 12, color: "var(--muted)" }}>No allergies recorded.</span>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input className="input" value={newAllergy} onChange={e => setNewAllergy(e.target.value)} placeholder="Add allergy…" style={{ flex: 1 }} onKeyDown={e => {
                  if (e.key === "Enter" && newAllergy.trim()) { setAllergies([...allergies, newAllergy.trim()]); setNewAllergy(""); }
                }}/>
                <button className="btn" onClick={() => { if (newAllergy.trim()) { setAllergies([...allergies, newAllergy.trim()]); setNewAllergy(""); } }}>Add</button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={save}><Icon name="check" size={13}/> Save changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Schedule Modal ──────────────────────────────────────

function QuickScheduleModal({ patient, onClose, pushToast }) {
  const [doctor, setDoctor] = useState(DOCTORS[0].id);
  const [day, setDay] = useState(1);
  const [time, setTime] = useState("10:00");
  const [type, setType] = useState("followup");
  const [notes, setNotes] = useState("");
  const doc = DOCTORS.find(d => d.id === doctor);
  const conflictPatient = patient.allergies.length > 0;

  const book = () => {
    const d = new Date(WEEK_START.getTime() + day * 86400000);
    pushToast(`Appointment booked — ${patient.name} with ${doc.name} on ${d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})} at ${time}`, "ok");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Schedule appointment</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{patient.name} · {patient.mrn}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body" style={{ padding: 20 }}>
          <div className="stack" style={{ gap: 12 }}>
            <div className="field">
              <label>Doctor</label>
              <select className="input" value={doctor} onChange={e => setDoctor(e.target.value)}>
                {DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="field">
                <label>Day</label>
                <select className="input" value={day} onChange={e => setDay(+e.target.value)}>
                  {[0,1,2,3,4].map(i => {
                    const d = new Date(WEEK_START.getTime() + i * 86400000);
                    return <option key={i} value={i}>{d.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}</option>;
                  })}
                </select>
              </div>
              <div className="field">
                <label>Time</label>
                <input className="input" type="time" value={time} onChange={e => setTime(e.target.value)}/>
              </div>
            </div>
            <div className="field">
              <label>Type</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {Object.entries(APPT_TYPES).map(([k,v]) => (
                  <button key={k} type="button" className={"btn" + (type === k ? " primary" : "")} onClick={() => setType(k)} style={{ justifyContent: "center" }}>{v.label}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Notes</label>
              <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reason for visit…"/>
            </div>
            {conflictPatient && (
              <div className="alert warn">
                <Icon name="alert" size={14} className="alert-ico"/>
                <div>
                  <div className="alert-title">Patient has recorded allergies</div>
                  <div>Verify doctor has access to chart before prescribing.</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={book}><Icon name="calendar" size={13}/> Book appointment</button>
        </div>
      </div>
    </div>
  );
}