// xTract — Auth screen (login + register)
const { useState: authUseState } = React;

function AuthScreen({ onLogin }) {
  const [mode, setMode]               = authUseState("login");
  const [username, setUsername]       = authUseState("");
  const [password, setPassword]       = authUseState("");
  const [displayName, setDisplayName] = authUseState("");
  const [error, setError]             = authUseState("");
  const [loading, setLoading]         = authUseState(false);

  function switchMode(m) { setMode(m); setError(""); }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { username, password }
        : { username, password, displayName: displayName.trim() || username };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      localStorage.setItem("xtract_token", data.token);
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="x-auth">
      <div className="x-auth__card">
        <div className="x-auth__logo">
          <svg viewBox="0 0 24 24" width="26" height="26">
            <path d="M4 4l7 8-7 8h4l5-6 5 6h4l-7-8 7-8h-4l-5 6-5-6z" fill="currentColor"/>
          </svg>
          <span className="x-auth__brand">xTract</span>
        </div>
        <h2 className="x-auth__title">{mode === "login" ? "Sign in" : "Create account"}</h2>
        <p className="x-auth__sub">
          {mode === "login" ? "Freight document audit platform" : "First account registered becomes admin"}
        </p>

        <form className="x-auth__form" onSubmit={submit}>
          {mode === "register" && (
            <div className="x-auth__field">
              <label className="x-auth__label">Display name</label>
              <input
                className="x-auth__input"
                type="text"
                placeholder="Your full name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}
          <div className="x-auth__field">
            <label className="x-auth__label">Username</label>
            <input
              className="x-auth__input"
              type="text"
              placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
              minLength={3}
            />
          </div>
          <div className="x-auth__field">
            <label className="x-auth__label">Password</label>
            <input
              className="x-auth__input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={6}
            />
          </div>

          {error && <div className="x-auth__error">{error}</div>}

          <button className="x-auth__submit" type="submit" disabled={loading || !username || !password}>
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="x-auth__switch">
          {mode === "login" ? (
            <>No account?{" "}
              <button className="x-auth__switchbtn" type="button" onClick={() => switchMode("register")}>Create one</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button className="x-auth__switchbtn" type="button" onClick={() => switchMode("login")}>Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AuthScreen });
