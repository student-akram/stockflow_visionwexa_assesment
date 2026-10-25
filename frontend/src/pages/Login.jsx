
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Boxes, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to log in. Please try again."
      );
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <Link to="/login" className="brand brand-light">
          <span className="brand-icon"><Boxes size={23} /></span>
          <span>StockFlow</span>
        </Link>

        <div className="auth-visual-content">
          <span className="eyebrow">INVENTORY, SIMPLIFIED</span>
          <h1>Your inventory.<br />Under control.</h1>
          <p>
            Know what you have, what is running low, and what needs your
            attention — all in one place.
          </p>
          <div className="visual-stat">
            <div className="visual-stat-icon"><Boxes size={21} /></div>
            <div>
              <strong>One clear view</strong>
              <span>Everything your shop needs to stay organized.</span>
            </div>
          </div>
        </div>

        <p className="visual-footer">Inventory management made simple.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="mobile-brand brand">
            <span className="brand-icon"><Boxes size={23} /></span>
            <span>StockFlow</span>
          </div>

          <div className="auth-heading">
            <span className="eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your details to continue to your workspace.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error" role="alert">{error}</div>}

            <label htmlFor="email">Email address</label>
            <div className="input-wrap">
              <Mail size={18} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="icon-button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button className="primary-button auth-submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create an account</Link>
          </p>
          <p className="auth-legal">Secure access to your inventory workspace.</p>
        </div>
      </section>
    </main>
  );
}
