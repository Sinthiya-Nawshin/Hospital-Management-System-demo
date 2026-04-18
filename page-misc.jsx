// page-misc.jsx — Billing, Pharmacy, Ambulance, Staff

function Billing({ pushToast }) {
  const [selected, setSelected] = useState(BILLS[0].id);
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
          <button className="btn"><Icon name="download" size={13}/> Export</button>
          <button className="btn primary"><Icon name="plus" size={13}/> New invoice</button>
        </div>
      </div>

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
              <button className="btn" style={{ flex: 1 }}>Send reminder</button>
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
          <button className="btn"><Icon name="download" size={13}/> Stock report</button>
          <button className="btn primary"><Icon name="plus" size={13}/> Add SKU</button>
        </div>
      </div>

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
            <th>Medication</th><th>Class</th><th className="right">Price</th><th>Stock</th><th className="right">On hand</th><th>Status</th>
          </tr></thead>
          <tbody>
            {visible.map(m => {
              const pct = Math.min(100, Math.round(m.stock / m.reorder * 100));
              const cls = pct < 30 ? "critical" : pct < 100 ? "low" : "";
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
          <button className="btn primary"><Icon name="ambulance" size={13}/> Dispatch</button>
        </div>
      </div>

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
              <button className="btn sm" style={{ flex: 1 }} disabled={a.status !== "available"}>Dispatch</button>
              <button className="btn sm"><Icon name="more" size={13}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Staff() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff & departments</h1>
          <p className="page-subtitle">{DOCTORS.length} doctors across {DEPARTMENTS.length} departments</p>
        </div>
        <div className="page-actions">
          <button className="btn primary"><Icon name="plus" size={13}/> Add staff</button>
        </div>
      </div>

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
