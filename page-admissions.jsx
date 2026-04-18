// page-admissions.jsx — room board

function Admissions({ pushToast, scenario, consumeScenario }) {
  const [selected, setSelected] = useState(null);
  const [wardFilter, setWardFilter] = useState("all");
  const [admitOpen, setAdmitOpen] = useState(false);

  useEffect(() => {
    if (!scenario) return;
    if (scenario.action === "discharge-block") {
      const r = ROOMS.find(x => x.id === "C-201");
      if (r) setSelected(r);
    } else if (scenario.action === "gender-room") {
      setAdmitOpen(true);
    }
    consumeScenario?.();
  }, [scenario]);

  const wards = Array.from(new Set(ROOMS.map(r => r.ward)));
  const visible = ROOMS.filter(r => wardFilter === "all" || r.ward === wardFilter);

  const stats = {
    total: ROOMS.length,
    occupied: ROOMS.filter(r => r.patientId).length,
    available: ROOMS.filter(r => !r.patientId && r.cleanStatus === "ok").length,
    cleaning: ROOMS.filter(r => r.cleanStatus === "cleaning").length,
    maintenance: ROOMS.filter(r => r.cleanStatus === "maint").length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admissions & ward board</h1>
          <p className="page-subtitle">
            {stats.occupied}/{stats.total} occupied · {stats.available} open · {stats.cleaning} cleaning · {stats.maintenance} maintenance
          </p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setAdmitOpen(true)}>
            <Icon name="plus" size={13}/> Admit patient
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        <div className="kpi"><div className="kpi-label">Capacity</div><div className="kpi-value">{Math.round(stats.occupied / stats.total * 100)}<span className="unit">%</span></div></div>
        <div className="kpi"><div className="kpi-label">Occupied</div><div className="kpi-value">{stats.occupied}</div></div>
        <div className="kpi"><div className="kpi-label">Open</div><div className="kpi-value" style={{ color: "var(--ok-soft-ink)" }}>{stats.available}</div></div>
        <div className="kpi"><div className="kpi-label">Cleaning</div><div className="kpi-value" style={{ color: "var(--warn-soft-ink)" }}>{stats.cleaning}</div></div>
        <div className="kpi"><div className="kpi-label">Maintenance</div><div className="kpi-value">{stats.maintenance}</div></div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <div className="segmented">
          <button className={wardFilter === "all" ? "on" : ""} onClick={() => setWardFilter("all")}>All wards</button>
          {wards.map(w => (
            <button key={w} className={wardFilter === w ? "on" : ""} onClick={() => setWardFilter(w)}>{w}</button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, fontSize: 11.5, color: "var(--muted)" }}>
          <span style={{ display: "flex", gap: 5, alignItems: "center" }}><span style={{ width: 10, height: 3, background: "oklch(0.68 0.14 340)", borderRadius: 1 }}/> Female</span>
          <span style={{ display: "flex", gap: 5, alignItems: "center" }}><span style={{ width: 10, height: 3, background: "oklch(0.58 0.13 245)", borderRadius: 1 }}/> Male</span>
          <span style={{ display: "flex", gap: 5, alignItems: "center" }}><span style={{ width: 10, height: 3, background: "var(--muted-2)", borderRadius: 1 }}/> Any</span>
        </div>
      </div>

      {wards.filter(w => wardFilter === "all" || w === wardFilter).map(w => {
        const wardRooms = visible.filter(r => r.ward === w);
        return (
          <div key={w} className="card" style={{ marginBottom: 14 }}>
            <div className="card-header">
              <div>
                <div className="card-title">{w}</div>
                <div className="card-subtitle">
                  {wardRooms.filter(r => r.patientId).length}/{wardRooms.length} occupied
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="ward-grid">
                {wardRooms.map(r => {
                  const pt = r.patientId ? PATIENTS.find(p => p.id === r.patientId) : null;
                  const isOcc = !!pt;
                  const cls = r.cleanStatus === "cleaning" ? "cleaning" : r.cleanStatus === "maint" ? "maintenance" : isOcc ? "occupied" : "available";
                  return (
                    <div key={r.id} className={`room ${cls}`} onClick={() => setSelected(r)}>
                      <div className={`g-strip ${r.gender === "F" ? "f" : r.gender === "M" ? "m" : "any"}`}/>
                      <div className="room-head">
                        <div className="room-id">{r.id}</div>
                        <div className="room-type">{r.type}</div>
                      </div>
                      {isOcc && (
                        <>
                          <div className="room-patient">{pt.name}</div>
                          <div className="room-meta">
                            <span>{ageFromDob(pt.dob)}{pt.gender}</span>
                            <span>·</span>
                            <span className="room-los">{daysAgo(r.since)}d</span>
                          </div>
                        </>
                      )}
                      {!isOcc && r.cleanStatus === "ok" && (
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                          Available · {r.gender === "F" ? "Female" : r.gender === "M" ? "Male" : "Any"}
                        </div>
                      )}
                      {r.cleanStatus === "cleaning" && (
                        <div style={{ fontSize: 12, color: "var(--warn-soft-ink)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <Icon name="refresh" size={11}/> Cleaning
                        </div>
                      )}
                      {r.cleanStatus === "maint" && (
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Maintenance</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {selected && <RoomModal room={selected} onClose={() => setSelected(null)} pushToast={pushToast}/>}
      {admitOpen && <AdmitModal onClose={() => setAdmitOpen(false)} pushToast={pushToast}/>}
    </div>
  );
}

function AdmitModal({ onClose, pushToast }) {
  const [patientId, setPatientId] = useState("");
  const [wardPref, setWardPref] = useState("any");
  const [roomId, setRoomId] = useState("");

  const pt = PATIENTS.find(p => p.id === patientId);

  // Gender-matching available rooms
  const availableRooms = useMemo(() => {
    if (!pt) return [];
    return ROOMS.filter(r =>
      !r.patientId &&
      r.cleanStatus === "ok" &&
      (r.gender === "any" || r.gender === pt.gender) &&
      (wardPref === "any" || r.ward === wardPref)
    );
  }, [pt, wardPref]);

  const mismatchedRooms = useMemo(() => {
    if (!pt) return [];
    return ROOMS.filter(r =>
      !r.patientId && r.cleanStatus === "ok" &&
      r.gender !== "any" && r.gender !== pt.gender
    );
  }, [pt]);

  const wards = Array.from(new Set(ROOMS.map(r => r.ward)));
  const chosenRoom = ROOMS.find(r => r.id === roomId);

  const canAdmit = pt && chosenRoom;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Admit patient</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Gender-matched room assignment · bed allocation</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body">
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div className="field">
              <label>Patient <span className="req">*</span></label>
              <select className="select" value={patientId} onChange={e => { setPatientId(e.target.value); setRoomId(""); }}>
                <option value="">Select patient…</option>
                {PATIENTS.filter(p => p.status !== "admitted").map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {ageFromDob(p.dob)}{p.gender} · {p.mrn}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Preferred ward</label>
              <select className="select" value={wardPref} onChange={e => { setWardPref(e.target.value); setRoomId(""); }}>
                <option value="any">Any ward</option>
                {wards.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>

          {pt && (
            <>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
                Eligible rooms for {pt.gender === "F" ? "female" : "male"} patient
              </div>
              {availableRooms.length === 0 ? (
                <div className="alert warn">
                  <Icon name="alert" size={16} className="alert-ico"/>
                  <div>
                    <div className="alert-title">No gender-matched rooms available</div>
                    <div>{mismatchedRooms.length} open rooms exist but are restricted to the other gender. Try a different ward or flag for re-designation.</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {availableRooms.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setRoomId(r.id)}
                      style={{
                        background: r.id === roomId ? "var(--accent-soft)" : "var(--surface)",
                        border: "1px solid " + (r.id === roomId ? "var(--accent)" : "var(--hairline)"),
                        borderRadius: 8, padding: "10px 12px",
                        textAlign: "left", cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.id}</div>
                        <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{r.ward} · {r.type}</div>
                      </div>
                      {r.id === roomId && <Icon name="check" size={14} style={{ color: "var(--accent-soft-ink)" }}/>}
                    </button>
                  ))}
                </div>
              )}
              {mismatchedRooms.length > 0 && availableRooms.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--muted)" }}>
                  <Icon name="info" size={12}/> {mismatchedRooms.length} other rooms filtered out: gender mismatch.
                </div>
              )}
            </>
          )}
          {!pt && (
            <div className="empty" style={{ padding: "24px 0" }}>
              <Icon name="user" size={20} style={{ color: "var(--muted-2)" }}/>
              <div style={{ marginTop: 6 }}>Select a patient to see eligible rooms.</div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!canAdmit} onClick={() => {
            pushToast(`${pt.name} admitted to ${chosenRoom.id}`, "ok");
            onClose();
          }}>
            <Icon name="check" size={13}/> Confirm admission
          </button>
        </div>
      </div>
    </div>
  );
}

function RoomModal({ room, onClose, pushToast }) {
  const pt = room.patientId ? PATIENTS.find(p => p.id === room.patientId) : null;
  const bill = pt ? BILLS.find(b => b.patientId === pt.id && b.status !== "paid") : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Room {room.id}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{room.ward} · {room.type} · {room.gender === "F" ? "Female" : room.gender === "M" ? "Male" : "Any"} allowed</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body">
          {pt ? (
            <>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, padding: 12, background: "var(--accent-soft)", borderRadius: 10 }}>
                <Avatar name={pt.name} hue={hueOf(pt.id)} size={44}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{pt.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{pt.mrn} · Admitted {daysAgo(room.since)} day{daysAgo(room.since) === 1 ? "" : "s"} ago</div>
                </div>
              </div>
              <dl className="deffn">
                <dt>Admitted</dt><dd>{new Date(room.since).toLocaleDateString("en-US",{month:"long",day:"numeric"})}</dd>
                <dt>Attending</dt><dd>{DOCTORS[0].name}</dd>
                <dt>Allergies</dt><dd>{pt.allergies.length ? pt.allergies.join(", ") : "None known"}</dd>
                <dt>Insurer</dt><dd>{pt.insurer}</dd>
              </dl>
              {bill && (
                <div className="alert warn" style={{ marginTop: 14 }}>
                  <Icon name="alert" size={16} className="alert-ico"/>
                  <div>
                    <div className="alert-title">Outstanding balance — {currency(bill.amount - (bill.paid||0))}</div>
                    <div>Discharge is blocked until all pending bills are settled. Bill <span className="mono">{bill.id}</span>.</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="alert info">
                <Icon name="info" size={16} className="alert-ico"/>
                <div>
                  <div className="alert-title">Room is available</div>
                  <div>Gender-matched patients ({room.gender === "any" ? "any gender" : room.gender === "F" ? "female only" : "male only"}) can be admitted here.</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Close</button>
          {pt ? (
            <>
              <button className="btn" onClick={() => { pushToast(`Transfer requested — ${pt.name}`, ""); onClose(); }}>Transfer</button>
              <button className="btn primary" disabled={!!bill} onClick={() => { pushToast(`Discharge processed — ${pt.name}`, "ok"); onClose(); }}>
                {bill ? <><Icon name="lock" size={12}/> Discharge blocked</> : <><Icon name="check" size={13}/> Discharge</>}
              </button>
            </>
          ) : (
            <button className="btn primary" onClick={() => { pushToast(`Admit flow opened for Room ${room.id}`, ""); onClose(); }}>Admit patient</button>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Admissions });
