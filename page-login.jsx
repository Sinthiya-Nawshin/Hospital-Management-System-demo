// page-login.jsx — simple auth gate, password "1234"

function Login({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("receptionist");
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (password === "1234") {
        localStorage.setItem("hms.authed", "1");
        localStorage.setItem("hms.role", role);
        onSuccess(role);
      } else {
        setError("Incorrect password. Try 1234.");
        setLoading(false);
      }
    }, 350);
  };

  const r = ROLES[role];

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "var(--bg)",
      fontFamily: "var(--font-sans)",
    }}>
      {/* LEFT — branded visual */}
      <div style={{
        background: "linear-gradient(160deg, oklch(0.32 0.08 245) 0%, oklch(0.42 0.13 245) 55%, oklch(0.55 0.15 245) 100%)",
        color: "white",
        padding: 48,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08, pointerEvents: "none" }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>

        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: "white",
            display: "grid", placeItems: "center", position: "relative",
          }}>
            <span style={{ position: "absolute", width: 16, height: 3, background: "var(--accent)", borderRadius: 1 }}/>
            <span style={{ position: "absolute", width: 3, height: 16, background: "var(--accent)", borderRadius: 1 }}/>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 17, letterSpacing: "-0.3px" }}>Meridian HMS</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Hospital Management</div>
          </div>
        </div>

        <div style={{ position: "relative", maxWidth: 460 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7, marginBottom: 12 }}>
            Unified clinical operations
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.8px", lineHeight: 1.15, margin: 0 }}>
            Register. Schedule. Admit.<br/>Treat. Bill. Discharge.
          </h1>
          <p style={{ fontSize: 14.5, lineHeight: 1.55, opacity: 0.85, marginTop: 16 }}>
            Nine modules, four roles, one workspace. Built for small-to-mid hospitals that need the discipline of enterprise systems without the weight.
          </p>

          <div style={{ display: "flex", gap: 24, marginTop: 32, fontSize: 12 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.4px" }}>9</div>
              <div style={{ opacity: 0.7 }}>modules</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.4px" }}>4</div>
              <div style={{ opacity: 0.7 }}>role-based views</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.4px" }}>12+</div>
              <div style={{ opacity: 0.7 }}>validation rules</div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11.5, opacity: 0.65, position: "relative" }}>
          © Meridian General · v1.0 · HIPAA-ready pattern
        </div>
      </div>

      {/* RIGHT — login form */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
      }}>
        <form onSubmit={submit} style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-soft-ink)", marginBottom: 10 }}>
            Sign in
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.5px", margin: "0 0 6px" }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 28px" }}>
            Enter your password to access the hospital system.
          </p>

          <div className="field" style={{ marginBottom: 14 }}>
            <label>Role</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {Object.values(ROLES).map(opt => (
                <button type="button" key={opt.id}
                  onClick={() => setRole(opt.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 10px",
                    border: "1px solid " + (opt.id === role ? "var(--accent)" : "var(--hairline)"),
                    background: opt.id === role ? "var(--accent-soft)" : "var(--surface)",
                    borderRadius: 8,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all .12s",
                  }}>
                  <Avatar name={opt.name} hue={opt.hue} size={22}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{opt.label}</div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {opt.name.split(" ")[0]}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="field" style={{ marginBottom: 6 }}>
            <label>Email</label>
            <input className="input" value={r.email} readOnly style={{ background: "var(--surface-2)" }}/>
          </div>

          <div className="field" style={{ marginBottom: 4 }}>
            <label>Password <span className="req">*</span></label>
            <input
              ref={inputRef}
              className={"input" + (error ? " input-error" : "")}
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              placeholder="••••"
              autoComplete="off"
            />
            {error && (
              <div className="field-err">
                <Icon name="alert" size={12}/> {error}
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0 18px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-2)", cursor: "pointer" }}>
              <input type="checkbox" defaultChecked/> Stay signed in
            </label>
            <a href="#" style={{ fontSize: 12, color: "var(--accent-soft-ink)", textDecoration: "none", fontWeight: 500 }} onClick={e => e.preventDefault()}>
              Forgot password?
            </a>
          </div>

          <button type="submit" className="btn primary lg" disabled={loading || !password} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? <><Icon name="refresh" size={14}/> Signing in…</> : <>Sign in <Icon name="chevRight" size={14}/></>}
          </button>

          <div style={{
            marginTop: 22,
            padding: "10px 12px",
            borderRadius: 8,
            background: "var(--surface-2)",
            border: "1px dashed var(--hairline-strong)",
            fontSize: 12,
            color: "var(--muted)",
            lineHeight: 1.5,
          }}>
            <div style={{ fontWeight: 600, color: "var(--ink-2)", marginBottom: 2 }}>
              <Icon name="info" size={12}/> Demo credentials
            </div>
            Pick a role above · password <code style={{ background: "var(--surface)", padding: "1px 5px", borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 11.5, border: "1px solid var(--hairline)" }}>1234</code>
          </div>
        </form>
      </div>
    </div>
  );
}

Object.assign(window, { Login });
