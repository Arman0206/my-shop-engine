import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const field = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  marginTop: "6px",
  padding: "12px",
  fontSize: "16px", // 16px stops iOS from zooming on focus
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
};

function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";

  // Already signed in: nothing to do here.
  if (user) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isRegister) await register(email, password, name);
      else await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(isRegister ? "login" : "register");
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "#f5f7fb",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "white",
          borderRadius: "18px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg,#2563eb,#7c3aed)",
            color: "white",
            padding: "24px 28px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "24px" }}>🛒 SmartCart</h1>
          <p style={{ margin: "6px 0 0" }}>
            {isRegister ? "Create your account" : "Sign in to your cart"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
          {isRegister && (
            <label style={{ display: "block", marginBottom: "16px" }}>
              Name
              <input
                style={field}
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}

          <label style={{ display: "block", marginBottom: "16px" }}>
            Email
            <input
              style={field}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label style={{ display: "block", marginBottom: "16px" }}>
            Password
            <input
              style={field}
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              minLength={isRegister ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {isRegister && (
              <small style={{ color: "#64748b" }}>At least 8 characters.</small>
            )}
          </label>

          {error && (
            <p role="alert" style={{ color: "#b91c1c", margin: "0 0 16px" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              fontWeight: "600",
              color: "white",
              background: submitting ? "#93c5fd" : "#2563eb",
              border: "none",
              borderRadius: "10px",
              cursor: submitting ? "default" : "pointer",
            }}
          >
            {submitting ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </button>

          <p style={{ textAlign: "center", marginBottom: 0 }}>
            {isRegister ? "Already have an account? " : "New here? "}
            <button
              type="button"
              onClick={switchMode}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "#2563eb",
                fontSize: "inherit",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              {isRegister ? "Sign in" : "Create an account"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
