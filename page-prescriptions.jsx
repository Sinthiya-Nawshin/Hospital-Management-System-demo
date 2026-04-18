// page-prescriptions.jsx — with live allergy check

function Prescriptions({ pushToast, scenario, consumeScenario }) {
  const [patientId, setPatientId] = useState("P-00412"); // Eleanor Marsh (penicillin allergy) — good demo
  const [items, setItems] = useState([
    { medId: "M-1002", dose: "10mg", freq: "Once daily", duration: "30 days", qty: 30 },
  ]);
  const [draftMed, setDraftMed] = useState("");
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!scenario) return;
    if (scenario.action === "allergy") {
      setPatientId("P-00412");
      setItems(xs => xs.some(i => i.medId === "M-1001") ? xs : [...xs, { medId: "M-1001", dose: "500mg", freq: "TID", duration: "7 days", qty: 21 }]);
    }
    consumeScenario?.();
  }, [scenario]);

  const patient = PATIENTS.find(p => p.id === patientId);

  // Check each item against allergies
  const itemsWithChecks = items.map(it => {
    const med = MEDICATIONS.find(m => m.id === it.medId);
    const conflicts = (med?.interacts || []).filter(ing =>
      patient.allergies.some(a => a.toLowerCase().includes(ing.toLowerCase()) || ing.toLowerCase().includes(a.toLowerCase()))
    );
    // Also match by med name
    const nameConflicts = patient.allergies.filter(a =>
      med?.name.toLowerCase().includes(a.toLowerCase()) ||
      (med?.class.toLowerCase().includes(a.toLowerCase()))
    );
    return { ...it, med, conflicts: Array.from(new Set([...conflicts, ...nameConflicts])) };
  });

  const blockerCount = itemsWithChecks.filter(it => it.conflicts.length > 0).length;

  const addItem = () => {
    if (!draftMed) return;
    setItems(xs => [...xs, { medId: draftMed, dose: "—", freq: "Once daily", duration: "7 days", qty: 7 }]);
    setDraftMed("");
  };

  const sign = () => {
    if (blockerCount > 0) return;
    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      pushToast(`Prescription signed — ${items.length} item${items.length===1?"":"s"} for ${patient.name}`, "ok");
    }, 800);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Prescription</h1>
          <p className="page-subtitle">Active safety check against patient allergies & interactions</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => pushToast("Draft saved locally", "ok")}><Icon name="download" size={13}/> Save draft</button>
          <button className="btn primary" disabled={blockerCount > 0 || signing} onClick={sign}>
            {signing ? <><Icon name="refresh" size={13}/> Signing…</> :
             blockerCount > 0 ? <><Icon name="lock" size={13}/> Blocked ({blockerCount})</> :
             <><Icon name="signature" size={13}/> Sign & dispense</>}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14 }}>
        <div className="stack" style={{ gap: 14 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Patient</div></div>
            <div className="card-body">
              <div className="field">
                <label>Prescribing for</label>
                <select className="select" value={patientId} onChange={e => setPatientId(e.target.value)}>
                  {PATIENTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name} · {p.mrn}{p.allergies.length > 0 ? ` · ${p.allergies.length} allergies` : ""}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12, padding: 12, background: "var(--surface-2)", borderRadius: 8 }}>
                <Avatar name={patient.name} hue={hueOf(patient.id)} size={40}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{patient.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{patient.mrn} · Age {ageFromDob(patient.dob)} · {patient.gender === "F" ? "Female" : "Male"} · Blood {patient.bloodType}</div>
                </div>
                {patient.allergies.length > 0 ? (
                  <div style={{ display: "flex", gap: 4 }}>
                    {patient.allergies.map(a => <Badge key={a} variant="danger" dot>{a}</Badge>)}
                  </div>
                ) : (
                  <Badge variant="ok" dot>No allergies</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Medications</div>
              <Badge variant="outline">{items.length}</Badge>
            </div>
            <div style={{ padding: 0 }}>
              {itemsWithChecks.map((it, i) => (
                <div key={i} style={{
                  padding: 14,
                  borderBottom: "1px solid var(--hairline)",
                  background: it.conflicts.length > 0 ? "var(--danger-soft)" : "transparent",
                }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: it.conflicts.length > 0 ? "var(--danger)" : "var(--accent-soft)",
                      color: it.conflicts.length > 0 ? "white" : "var(--accent-soft-ink)",
                      display: "grid", placeItems: "center", flexShrink: 0,
                    }}>
                      <Icon name={it.conflicts.length > 0 ? "alert" : "pill"} size={18}/>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{it.med?.name}</div>
                          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{it.med?.class} · {it.med?.id}</div>
                        </div>
                        <button className="icon-btn" onClick={() => setItems(xs => xs.filter((_,j) => j !== i))}>
                          <Icon name="trash" size={14}/>
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px", gap: 8, marginTop: 10 }}>
                        <div className="field">
                          <label>Dose</label>
                          <input className="input" value={it.dose} onChange={e => setItems(xs => xs.map((x,j) => j===i?{...x,dose:e.target.value}:x))}/>
                        </div>
                        <div className="field">
                          <label>Frequency</label>
                          <select className="select" value={it.freq} onChange={e => setItems(xs => xs.map((x,j) => j===i?{...x,freq:e.target.value}:x))}>
                            <option>Once daily</option>
                            <option>Twice daily</option>
                            <option>Three times daily</option>
                            <option>As needed</option>
                          </select>
                        </div>
                        <div className="field">
                          <label>Duration</label>
                          <input className="input" value={it.duration} onChange={e => setItems(xs => xs.map((x,j) => j===i?{...x,duration:e.target.value}:x))}/>
                        </div>
                        <div className="field">
                          <label>Qty</label>
                          <input className="input mono" value={it.qty} onChange={e => setItems(xs => xs.map((x,j) => j===i?{...x,qty:e.target.value}:x))}/>
                        </div>
                      </div>

                      {it.conflicts.length > 0 && (
                        <div className="alert danger" style={{ marginTop: 12 }}>
                          <Icon name="alert" size={16} className="alert-ico"/>
                          <div>
                            <div className="alert-title">Allergy conflict blocks this prescription</div>
                            <div>
                              Patient has a documented allergy to <b>{it.conflicts.join(", ")}</b>.
                              Hospital policy prevents dispensing. Consult alternative in <b>{it.med?.class}</b> class or override with clinical justification.
                            </div>
                            <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                              <button className="btn sm" onClick={() => pushToast(`Alternative suggested: same class (${it.med?.class}), no allergen match`, "")}>Suggest alternative</button>
                              <button className="btn sm" onClick={() => pushToast("Override request sent to attending physician for review", "")}>Request override</button>
                              <button className="btn sm danger" onClick={() => setItems(xs => xs.filter((_,j) => j !== i))}>Remove</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ padding: 14, display: "flex", gap: 8 }}>
                <select className="select" value={draftMed} onChange={e => setDraftMed(e.target.value)} style={{ flex: 1 }}>
                  <option value="">Add medication…</option>
                  {MEDICATIONS.filter(m => !items.some(it => it.medId === m.id)).map(m => (
                    <option key={m.id} value={m.id}>{m.name} — {m.class} · {currency(m.price)}</option>
                  ))}
                </select>
                <button className="btn" disabled={!draftMed} onClick={addItem}>
                  <Icon name="plus" size={13}/> Add
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Clinical notes</div></div>
            <div className="card-body">
              <textarea className="input" placeholder="Diagnosis, rationale, follow-up instructions…" style={{ minHeight: 90 }}/>
            </div>
          </div>
        </div>

        <div className="stack" style={{ gap: 14 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Safety check</div></div>
            <div className="card-body">
              {blockerCount === 0 ? (
                <div className="alert ok">
                  <Icon name="shield" size={16} className="alert-ico"/>
                  <div>
                    <div className="alert-title">All clear</div>
                    <div>No allergy conflicts or duplicate therapies detected.</div>
                  </div>
                </div>
              ) : (
                <div className="alert danger">
                  <Icon name="alert" size={16} className="alert-ico"/>
                  <div>
                    <div className="alert-title">{blockerCount} item{blockerCount===1?"":"s"} blocked</div>
                    <div>Resolve allergy conflicts before signing. Hospital policy ECA rule <span className="mono">RX-ALG-01</span>.</div>
                  </div>
                </div>
              )}
              <div className="sep"/>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Automatic checks</div>
              <div className="stack" style={{ gap: 6 }}>
                {[
                  { ok: patient.allergies.length === 0 || blockerCount === 0, label: "Patient allergies", sub: patient.allergies.length === 0 ? "None on file" : `${patient.allergies.length} documented` },
                  { ok: true, label: "Drug-drug interactions", sub: "No major interactions detected" },
                  { ok: true, label: "Dose range", sub: "All doses within clinical range" },
                  { ok: true, label: "Pregnancy safety", sub: "Not applicable" },
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "6px 0" }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: c.ok ? "var(--ok-soft)" : "var(--danger-soft)",
                      color: c.ok ? "var(--ok-soft-ink)" : "var(--danger-soft-ink)",
                      display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1,
                    }}>
                      <Icon name={c.ok ? "check" : "x"} size={11} strokeWidth={2.5}/>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{c.label}</div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{c.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Summary</div></div>
            <div className="card-body">
              <dl className="deffn">
                <dt>Items</dt><dd>{items.length}</dd>
                <dt>Total</dt><dd className="mono">{currency(itemsWithChecks.reduce((s, it) => s + (it.med?.price || 0) * (+it.qty || 0), 0))}</dd>
                <dt>Covered by</dt><dd>{patient.insurer}</dd>
                <dt>Est. patient pay</dt><dd className="mono">{currency(itemsWithChecks.reduce((s, it) => s + (it.med?.price || 0) * (+it.qty || 0), 0) * 0.2)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Prescriptions });
