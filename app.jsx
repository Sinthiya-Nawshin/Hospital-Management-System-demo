// app.jsx — root, routing, tweaks, scenarios, tour

const { useState: uS, useEffect: uE, useRef: uR } = React;

function App() {
  const [role, setRole] = uS(() => localStorage.getItem("hms.role") || "receptionist");
  const [page, setPage] = uS(() => localStorage.getItem("hms.page") || "dashboard");
  const [tweaksOn, setTweaksOn] = uS(false);
  const [scenarioOpen, setScenarioOpen] = uS(false);
  const [activeScenario, setActiveScenario] = uS(null);
  const [tourStep, setTourStep] = uS(() => localStorage.getItem("hms.tour-done") ? -1 : 0);
  const [pushToast, toastNode] = useToasts();

  uE(() => { localStorage.setItem("hms.role", role); }, [role]);
  uE(() => { localStorage.setItem("hms.page", page); }, [page]);
  uE(() => {
    const allowed = new Set(ROLES[role].nav);
    if (!allowed.has(page)) setPage("dashboard");
  }, [role]);

  uE(() => {
    const handler = (e) => {
      if (!e.data) return;
      if (e.data.type === "__activate_edit_mode") setTweaksOn(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksOn(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  const runScenario = (s) => {
    setScenarioOpen(false);
    setRole(s.role);
    setPage(s.page);
    // Set a consumable scenario flag that the target page will pick up
    setActiveScenario({ ...s, ts: Date.now() });
    pushToast(`Running: ${s.title}`, "");
  };

  // Pages consume activeScenario; clear after a moment
  const consumeScenario = () => setActiveScenario(null);

  const skipTour = () => { setTourStep(-1); localStorage.setItem("hms.tour-done", "1"); };
  const nextTour = () => {
    if (tourStep >= TOUR_STEPS.length - 1) skipTour();
    else setTourStep(s => s + 1);
  };

  const renderPage = () => {
    const common = { role, pushToast, scenario: activeScenario, consumeScenario };
    switch (page) {
      case "dashboard":     return <Dashboard role={role} setPage={setPage} pushToast={pushToast} onOpenScenarios={() => setScenarioOpen(true)}/>;
      case "patients":      return <Patients {...common}/>;
      case "appointments":  return <Appointments {...common}/>;
      case "admissions":    return <Admissions {...common}/>;
      case "prescriptions": return <Prescriptions {...common}/>;
      case "billing":       return <Billing {...common}/>;
      case "pharmacy":      return <Pharmacy {...common}/>;
      case "ambulance":     return <Ambulance {...common}/>;
      case "staff":         return <Staff/>;
      default:              return <Dashboard role={role} setPage={setPage} pushToast={pushToast} onOpenScenarios={() => setScenarioOpen(true)}/>;
    }
  };

  const tourActive = tourStep >= 0 && tourStep < TOUR_STEPS.length;

  return (
    <div className="app" data-screen-label={page}>
      <Brand/>
      <TopBar
        role={role} setRole={setRole} page={page} setPage={setPage}
        onOpenSearch={() => {}}
        onOpenScenarios={() => setScenarioOpen(true)}
      />
      <Sidebar page={page} setPage={setPage} role={role}/>
      <main className="main">{renderPage()}</main>
      {toastNode}
      {tweaksOn && <TweaksPanel role={role} setRole={setRole}/>}
      <ScenarioLauncher open={scenarioOpen} onClose={() => setScenarioOpen(false)} onRun={runScenario}/>
      {tourActive && (
        <Spotlight
          target={TOUR_STEPS[tourStep].target}
          title={TOUR_STEPS[tourStep].title}
          body={TOUR_STEPS[tourStep].body}
          step={tourStep + 1}
          total={TOUR_STEPS.length}
          onNext={nextTour}
          onSkip={skipTour}
        />
      )}
    </div>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "role": "receptionist",
  "direction": "clinical"
}/*EDITMODE-END*/;

function TweaksPanel({ role, setRole }) {
  const [direction, setDirection] = uS(() => document.documentElement.getAttribute("data-direction") || "clinical");
  const setDir = (d) => {
    setDirection(d);
    if (d === "clinical") document.documentElement.removeAttribute("data-direction");
    else document.documentElement.setAttribute("data-direction", d);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { direction: d } }, "*");
  };
  const setR = (r) => {
    setRole(r);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { role: r } }, "*");
  };
  return (
    <div className="tweaks-panel">
      <h4>Tweaks <Icon name="sparkle" size={13} style={{ color: "var(--accent)" }}/></h4>
      <div className="tweak-row">
        <div className="tweak-label">Role</div>
        <div className="tweak-options" style={{ flexWrap: "wrap" }}>
          {Object.values(ROLES).map(r => (
            <button key={r.id} className={r.id === role ? "on" : ""} onClick={() => setR(r.id)}>{r.label}</button>
          ))}
        </div>
      </div>
      <div className="tweak-row">
        <div className="tweak-label">Visual direction</div>
        <div className="tweak-options">
          <button className={direction === "clinical" ? "on" : ""} onClick={() => setDir("clinical")}>Clinical</button>
          <button className={direction === "warm" ? "on" : ""} onClick={() => setDir("warm")}>Warm</button>
          <button className={direction === "dense" ? "on" : ""} onClick={() => setDir("dense")}>Dense</button>
        </div>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--muted-2)", marginTop: 10, lineHeight: 1.4 }}>
        Clinical: calm blues · Warm: off-white + terracotta accent · Dense: tighter radii, deeper ink
      </div>
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--hairline)" }}>
        <button className="btn sm" style={{ width: "100%" }} onClick={() => { localStorage.removeItem("hms.tour-done"); location.reload(); }}>
          <Icon name="refresh" size={12}/> Restart tour
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
