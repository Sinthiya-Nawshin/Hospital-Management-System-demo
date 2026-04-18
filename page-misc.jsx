// page-misc.jsx — Billing, Pharmacy, Ambulance, Staff

function Billing({ pushToast }) {
  const [selected, setSelected] = useState(BILLS[0].id);
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const bill = BILLS.find(b => b.id === selected);
  const pt = PATIENTS.find(p => p.id === bill.patientId);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & discharge</h1>
          <p className="page-subtitle">
            {BILLS.filter(b => b.status !== "paid").length} pending · {currency(BILLS.filter(b => b.status !== "paid").reduce((s,b) => s + (b.amount - (b.paid||0)), 0))} outstanding
          </p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => pushToast(`Exported ${BILLS.length} invoices to CSV`, "ok")}><Icon name="download" size={13}/> Export</button>
          <button className="btn primary" onClick={() => setNewInvoiceOpen(true)}><Icon name="plus" size={13}/> New invoice</button>
        </div>
      </div>

      {newInvoiceOpen && <NewInvoiceModal onClose={() => setNewInvoiceOpen(false)} pushToast={pushToast}/>}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Invoices</div></div>
          <table className="tbl">
            <thead><tr><th>Invoice</th><th>Patient</th><th>Date</th><th className="right">Amount</th><th>Status</th></tr></thead>
            <tbody>
              {BILLS.map(b => {
                const p = PATIENTS.find(x => x.id === b.patientId);
                return (
                  <tr key={b.id} onClick={() => setSelected(b.id)} className={b.id === selected ? "selected" : ""}>
                    <td className="mono">{b.id}</td>
                    <td>{p?.name}</td>
                    <td className="muted-cell">{new Date(b.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</td>
                    <td className="right num">{currency(b.amount)}</td>
                    <td>
                      {b.status === "paid" && <Badge variant="ok" dot>Paid</Badge>}
                      {b.status === "partial" && <Badge variant="warn" dot>Partial</Badge>}
                      {b.status === "pending" && <Badge variant="danger" dot>Pending</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ alignSelf: "flex-start", position: "sticky", top: 20 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Invoice {bill.id}</div>
              <div className="card-subtitle">{pt?.name} · {new Date(bill.date).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
            </div>
            {bill.status === "paid" && <Badge variant="ok" dot>Paid</Badge>}
            {bill.status === "partial" && <Badge variant="warn" dot>Partial</Badge>}
            {bill.status === "pending" && <Badge variant="danger" dot>Pending</Badge>}
          </div>
          <table className="tbl"><tbody>
            {bill.items.map((it,i) => (
              <tr key={i}><td>{it.label}</td><td className="right num">{currency(it.amount)}</td></tr>
            ))}
            <tr><td style={{ fontWeight: 600 }}>Total</td><td className="right num" style={{ fontWeight: 600 }}>{currency(bill.amount)}</td></tr>
            {bill.paid && <tr><td className="muted-cell">Paid</td><td className="right num muted-cell">−{currency(bill.paid)}</td></tr>}
            {bill.amount - (bill.paid||0) > 0 && (
              <tr><td style={{ fontWeight: 600 }}>Balance due</td><td className="right num" style={{ fontWeight: 600, color: "var(--danger-soft-ink)" }}>{currency(bill.amount - (bill.paid||0))}</td></tr>
            )}
          </tbody></table>
          <div style={{ padding: 14 }}>
            {bill.status !== "paid" && pt?.status === "admitted" && (
              <div className="alert warn" style={{ marginBottom: 12 }}>
                <Icon name="lock" size={16} className="alert-ico"/>
                <div>
                  <div className="alert-title">Discharge is blocked</div>
                  <div>{pt.name} cannot be discharged until this balance is settled. ECA rule <span className="mono">BIL-DSC-01</span>.</div>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => pushToast(`Reminder sent to ${pt?.name}`, "ok")}>Send reminder</button>
              <button className="btn primary" style={{ flex: 1 }} disabled={bill.status === "paid"} onClick={() => pushToast(`Payment recorded — ${currency(bill.amount - (bill.paid||0))}`, "ok")}>
                <Icon name="check" size={13}/> Record payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pharmacy({ pushToast }) {
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [reorderTarget, setReorderTarget] = useState(null);
  const visible = MEDICATIONS.filter(m => !query || m.name.toLowerCase().includes(query.toLowerCase()) || m.class.toLowerCase().includes(query.toLowerCase()));
  const lowCount = MEDICATIONS.filter(m => m.stock < m.reorder).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pharmacy inventory</h1>
          <p className="page-subtitle">{MEDICATIONS.length} SKUs · {lowCount} below reorder point</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => pushToast(`Stock report exported — ${MEDICATIONS.length} SKUs`, "ok")}><Icon name="download" size={13}/> Stock report</button>
          <button className="btn primary" onClick={() => setAddOpen(true)}><Icon name="plus" size={13}/> Add SKU</button>
        </div>
      </div>

      {addOpen && <AddSkuModal onClose={() => setAddOpen(false)} pushToast={pushToast}/>}
      {reorderTarget && <ReorderModal med={reorderTarget} onClose={() => setReorderTarget(null)} pushToast={pushToast}/>}

      <div style={{ marginBottom: 14, display: "flex", gap: 10, alignItems: "center" }}>
        <div className="topbar-search" style={{ maxWidth: 320, marginLeft: 0 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }}><Icon name="search" size={14}/></span>
          <input placeholder="Search medication, class…" value={query} onChange={e => setQuery(e.target.value)}/>
        </div>
        <Badge variant="warn">{lowCount} low stock</Badge>
        <Badge variant="ok">{MEDICATIONS.length - lowCount} healthy</Badge>
      </div>

      <div className="card">
        <table className="tbl">
          <thead><tr>
            <th>Medication</th><th>Class</th><th className="right">Price</th><th>Stock</th><th className="right">On hand</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {visible.map(m => {
              const pct = Math.min(100, Math.round(m.stock / m.reorder * 100));
              const cls = pct < 30 ? "critical" : pct < 100 ? "low" : "";
              const isLow = m.stock < m.reorder;
              return (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: "var(--ink)" }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }} className="mono">{m.id}</div>
                  </td>
                  <td className="muted-cell">{m.class}</td>
                  <td className="right num">{currency(m.price)}</td>
                  <td style={{ width: 140 }}>
                    <div className="stockbar"><span className={cls} style={{ width: pct + "%" }}/></div>
                  </td>
                  <td className="right num">{m.stock.toLocaleString()}</td>
                  <td>
                    {m.stock < m.reorder * 0.3 ? <Badge variant="danger" dot>Critical</Badge> :
                     m.stock < m.reorder ? <Badge variant="warn" dot>Low</Badge> :
                     <Badge variant="ok" dot>Healthy</Badge>}
                  </td>
                  <td style={{ width: 110 }}>
                    {isLow
                      ? <button className="btn sm primary" onClick={() => setReorderTarget(m)}><Icon name="refresh" size={11}/> Reorder</button>
                      : <button className="btn sm" onClick={() => setReorderTarget(m)}>Adjust</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Ambulance({ pushToast }) {
  const [dispatchOpen, setDispatchOpen] = useState(null); // holds ambulance obj or "new"
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ambulance fleet</h1>
          <p className="page-subtitle">
            {AMBULANCES.filter(a => a.status === "available").length} available · {AMBULANCES.filter(a => a.status === "dispatched").length} dispatched · {AMBULANCES.filter(a => a.status === "maintenance").length} maintenance
          </p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setDispatchOpen("new")}><Icon name="ambulance" size={13}/> Dispatch</button>
        </div>
      </div>

      {dispatchOpen && <DispatchModal ambulance={dispatchOpen === "new" ? null : dispatchOpen} onClose={() => setDispatchOpen(null)} pushToast={pushToast}/>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {AMBULANCES.map(a => (
          <div className="card" key={a.id} style={{ padding: 14, borderLeft: "3px solid " + (a.status === "available" ? "var(--ok)" : a.status === "dispatched" ? "var(--warn)" : "var(--muted-2)") }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.2px" }}>{a.id}</div>
                <div className="mono" style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{a.reg}</div>
              </div>
              {a.status === "available" && <Badge variant="ok" dot>Available</Badge>}
              {a.status === "dispatched" && <Badge variant="warn" dot>Dispatched</Badge>}
              {a.status === "maintenance" && <Badge variant="outline">Maintenance</Badge>}
            </div>
            <div className="sep"/>
            <dl className="deffn">
              <dt>Driver</dt><dd>{a.driver}</dd>
              <dt>Mileage</dt><dd className="mono">{a.mileage.toLocaleString()} km</dd>
              <dt>Last</dt><dd>{a.lastDispatch}</dd>
              {a.eta && <><dt>ETA</dt><dd style={{ color: "var(--warn-soft-ink)", fontWeight: 600 }}>{a.eta}</dd></>}
            </dl>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <button className="btn sm" style={{ flex: 1 }} disabled={a.status !== "available"} onClick={() => setDispatchOpen(a)}>Dispatch</button>
              <button className="btn sm" onClick={() => pushToast(`Maintenance log for ${a.id} opened`, "")} title="View details"><Icon name="more" size={13}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Staff() {
  const [addOpen, setAddOpen] = useState(false);
  const [toast, toastNode] = useToasts();
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff & departments</h1>
          <p className="page-subtitle">{DOCTORS.length} doctors across {DEPARTMENTS.length} departments</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setAddOpen(true)}><Icon name="plus" size={13}/> Add staff</button>
        </div>
      </div>

      {toastNode}
      {addOpen && <AddStaffModal onClose={() => setAddOpen(false)} pushToast={toast}/>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
        {DEPARTMENTS.map(d => {
          const docs = DOCTORS.filter(doc => doc.dept === d.id);
          return (
            <div className="card" key={d.id} style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                <Badge variant={d.color}>{docs.length}</Badge>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }} className="mono">{d.id}</div>
              <div style={{ display: "flex", marginTop: 12, gap: -4 }}>
                {docs.slice(0,5).map((doc,i) => (
                  <div key={doc.id} style={{ marginLeft: i === 0 ? 0 : -6 }}>
                    <Avatar name={doc.name} hue={doc.hue} size={24}/>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Doctors</div></div>
        <table className="tbl">
          <thead><tr><th>Doctor</th><th>Department</th><th>Email</th><th>ID</th><th>Today's load</th></tr></thead>
          <tbody>
            {DOCTORS.map(d => {
              const load = APPOINTMENTS.filter(a => a.doctorId === d.id && a.day === 2).length;
              return (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Avatar name={d.name} hue={d.hue} size={28}/>
                      <div style={{ fontWeight: 500 }}>{d.name}</div>
                    </div>
                  </td>
                  <td>{DEPARTMENTS.find(x => x.id === d.dept).name}</td>
                  <td className="mono muted-cell">{d.email}</td>
                  <td className="mono">{d.id}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 80 }} className="stockbar">
                        <span style={{ width: Math.min(100, load * 25) + "%", background: load >= 4 ? "var(--danger)" : load >= 3 ? "var(--warn)" : "var(--accent)" }}/>
                      </div>
                      <span className="mono" style={{ fontSize: 12 }}>{load} appts</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { Billing, Pharmacy, Ambulance, Staff });

// ───────────── New Invoice Modal ─────────────

function NewInvoiceModal({ onClose, pushToast }) {
  const [patientId, setPatientId] = useState("");
  const [items, setItems] = useState([{ label: "Consultation", amount: 150 }]);
  const total = items.reduce((s,i) => s + (+i.amount || 0), 0);
  const pt = PATIENTS.find(p => p.id === patientId);
  const canSave = patientId && total > 0 && items.every(i => i.label);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div className="modal-title">New invoice</div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body" style={{ padding: 20 }}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Patient <span className="req">*</span></label>
            <select className="input" value={patientId} onChange={e => setPatientId(e.target.value)}>
              <option value="">Select patient…</option>
              {PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name} · {p.mrn}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Line items</label>
            <div className="stack" style={{ gap: 6 }}>
              {items.map((it,i) => (
                <div key={i} style={{ display: "flex", gap: 6 }}>
                  <input className="input" style={{ flex: 1 }} value={it.label} placeholder="Description" onChange={e => { const n = [...items]; n[i] = {...n[i], label: e.target.value}; setItems(n); }}/>
                  <input className="input" style={{ width: 110 }} type="number" value={it.amount} onChange={e => { const n = [...items]; n[i] = {...n[i], amount: +e.target.value}; setItems(n); }}/>
                  <button className="btn sm" onClick={() => setItems(items.filter((_,j) => j !== i))} disabled={items.length === 1}><Icon name="x" size={12}/></button>
                </div>
              ))}
            </div>
            <button className="btn sm" style={{ marginTop: 6 }} onClick={() => setItems([...items, { label: "", amount: 0 }])}><Icon name="plus" size={12}/> Add line</button>
          </div>
          <div style={{ marginTop: 16, padding: 12, background: "var(--surface-2)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 600 }} className="mono">{currency(total)}</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!canSave} onClick={() => { pushToast(`Invoice created — ${pt?.name} · ${currency(total)}`, "ok"); onClose(); }}>
            <Icon name="check" size={13}/> Create invoice
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────── Add SKU Modal ─────────────

function AddSkuModal({ onClose, pushToast }) {
  const [d, setD] = useState({ name: "", drugClass: "", price: "", stock: "", reorder: "" });
  const canSave = d.name && d.drugClass && d.price && d.stock && d.reorder;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <div className="modal-title">Add medication SKU</div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body" style={{ padding: 20 }}>
          <div className="stack" style={{ gap: 12 }}>
            <div className="field">
              <label>Name <span className="req">*</span></label>
              <input className="input" value={d.name} onChange={e => setD({...d, name: e.target.value})} placeholder="e.g. Amoxicillin 500mg" autoFocus/>
            </div>
            <div className="field">
              <label>Class <span className="req">*</span></label>
              <input className="input" value={d.drugClass} onChange={e => setD({...d, drugClass: e.target.value})} placeholder="e.g. Antibiotic"/>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <div className="field">
                <label>Price <span className="req">*</span></label>
                <input className="input" type="number" value={d.price} onChange={e => setD({...d, price: e.target.value})}/>
              </div>
              <div className="field">
                <label>On hand <span className="req">*</span></label>
                <input className="input" type="number" value={d.stock} onChange={e => setD({...d, stock: e.target.value})}/>
              </div>
              <div className="field">
                <label>Reorder at <span className="req">*</span></label>
                <input className="input" type="number" value={d.reorder} onChange={e => setD({...d, reorder: e.target.value})}/>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!canSave} onClick={() => { pushToast(`Added SKU — ${d.name}`, "ok"); onClose(); }}>
            <Icon name="check" size={13}/> Add SKU
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────── Reorder Modal ─────────────

function ReorderModal({ med, onClose, pushToast }) {
  const gap = Math.max(0, med.reorder * 2 - med.stock);
  const [qty, setQty] = useState(gap || 100);
  const [supplier, setSupplier] = useState("MediCore Wholesale");
  const cost = qty * med.price * 0.6; // bulk discount
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Reorder stock</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{med.name} · {med.id}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body" style={{ padding: 20 }}>
          <div className="stack" style={{ gap: 12 }}>
            <div style={{ padding: 10, background: "var(--surface-2)", borderRadius: 8, fontSize: 12, display: "flex", gap: 16 }}>
              <span>On hand: <b className="mono">{med.stock.toLocaleString()}</b></span>
              <span>Reorder at: <b className="mono">{med.reorder.toLocaleString()}</b></span>
              <span>Suggested: <b className="mono">{gap.toLocaleString()}</b></span>
            </div>
            <div className="field">
              <label>Order quantity <span className="req">*</span></label>
              <input className="input" type="number" value={qty} onChange={e => setQty(+e.target.value)}/>
            </div>
            <div className="field">
              <label>Supplier</label>
              <select className="input" value={supplier} onChange={e => setSupplier(e.target.value)}>
                <option>MediCore Wholesale</option>
                <option>Pharma Direct</option>
                <option>Regional Dist. Co.</option>
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 10, borderRadius: 8, background: "var(--accent-soft)", fontSize: 13 }}>
              <span>Estimated cost</span>
              <span className="mono" style={{ fontWeight: 600 }}>{currency(cost)}</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!qty} onClick={() => { pushToast(`Reorder placed — ${qty} × ${med.name} from ${supplier}`, "ok"); onClose(); }}>
            <Icon name="check" size={13}/> Place order
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────── Dispatch Modal ─────────────

function DispatchModal({ ambulance, onClose, pushToast }) {
  const available = AMBULANCES.filter(a => a.status === "available");
  const [ambId, setAmbId] = useState(ambulance?.id || available[0]?.id || "");
  const [location, setLocation] = useState("");
  const [caller, setCaller] = useState("");
  const [urgency, setUrgency] = useState("urgent");
  const amb = AMBULANCES.find(a => a.id === ambId);
  const canDispatch = ambId && location && caller;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Dispatch ambulance</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{available.length} units available</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body" style={{ padding: 20 }}>
          <div className="stack" style={{ gap: 12 }}>
            <div className="field">
              <label>Unit <span className="req">*</span></label>
              <select className="input" value={ambId} onChange={e => setAmbId(e.target.value)}>
                <option value="">Select available unit…</option>
                {available.map(a => <option key={a.id} value={a.id}>{a.id} · {a.driver} · {a.reg}</option>)}
              </select>
              {amb && <div className="field-hint">Driver: {amb.driver} · Last dispatch {amb.lastDispatch}</div>}
            </div>
            <div className="field">
              <label>Pickup location <span className="req">*</span></label>
              <input className="input" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. 847 Elm St, Apt 12"/>
            </div>
            <div className="field">
              <label>Caller contact <span className="req">*</span></label>
              <input className="input" value={caller} onChange={e => setCaller(e.target.value)} placeholder="Name and phone"/>
            </div>
            <div className="field">
              <label>Urgency</label>
              <div className="segmented" style={{ width: "100%", display: "flex" }}>
                {[
                  { k: "routine", l: "Routine" },
                  { k: "urgent", l: "Urgent" },
                  { k: "critical", l: "Critical" },
                ].map(u => (
                  <button key={u.k} className={urgency === u.k ? "on" : ""} onClick={() => setUrgency(u.k)} style={{ flex: 1 }}>{u.l}</button>
                ))}
              </div>
            </div>
            {urgency === "critical" && (
              <div className="alert danger">
                <Icon name="alert" size={14} className="alert-ico"/>
                <div>
                  <div className="alert-title">Critical — trauma team on standby</div>
                  <div>ER will be notified automatically. ETA will be flagged with highest priority.</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!canDispatch} onClick={() => { pushToast(`Dispatched ${ambId} to ${location}`, "ok"); onClose(); }}>
            <Icon name="ambulance" size={13}/> Dispatch now
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────── Add Staff Modal ─────────────

function AddStaffModal({ onClose, pushToast }) {
  const [d, setD] = useState({ firstName: "", lastName: "", specialty: "", dept: DEPARTMENTS[0].id, email: "" });
  const canSave = d.firstName && d.lastName && d.specialty && d.email && /^\S+@\S+\.\S+$/.test(d.email);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div className="modal-title">Add staff member</div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body" style={{ padding: 20 }}>
          <div className="stack" style={{ gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="field">
                <label>First name <span className="req">*</span></label>
                <input className="input" value={d.firstName} onChange={e => setD({...d, firstName: e.target.value})} autoFocus/>
              </div>
              <div className="field">
                <label>Last name <span className="req">*</span></label>
                <input className="input" value={d.lastName} onChange={e => setD({...d, lastName: e.target.value})}/>
              </div>
            </div>
            <div className="field">
              <label>Department <span className="req">*</span></label>
              <select className="input" value={d.dept} onChange={e => setD({...d, dept: e.target.value})}>
                {DEPARTMENTS.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Specialty <span className="req">*</span></label>
              <input className="input" value={d.specialty} onChange={e => setD({...d, specialty: e.target.value})} placeholder="e.g. Cardiologist"/>
            </div>
            <div className="field">
              <label>Email <span className="req">*</span></label>
              <input className="input" value={d.email} onChange={e => setD({...d, email: e.target.value})} placeholder="name@meridian.hospital"/>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!canSave} onClick={() => { pushToast(`Added ${d.firstName} ${d.lastName} to ${DEPARTMENTS.find(x => x.id === d.dept).name}`, "ok"); onClose(); }}>
            <Icon name="check" size={13}/> Add staff
          </button>
        </div>
      </div>
    </div>
  );
}
