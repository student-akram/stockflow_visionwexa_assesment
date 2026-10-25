
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Boxes,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Store,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    try {
      await signup(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create your account."
      );
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <Link to="/signup" className="brand brand-light">
          <span className="brand-icon"><Boxes size={23} /></span>
          <span>StockFlow</span>
        </Link>

        <div className="auth-visual-content">
          <span className="eyebrow">A BETTER WAY TO MANAGE STOCK</span>
          <h1>Make room for<br />better business.</h1>
          <p>
            Bring your inventory into one organized workspace and spend less
            time wondering what is in stock.
          </p>
          <div className="visual-stat">
            <div className="visual-stat-icon"><Store size={21} /></div>
            <div>
              <strong>Your shop, your workspace</strong>
              <span>Your inventory stays organized by business.</span>
            </div>
          </div>
        </div>

        <p className="visual-footer">Get started with StockFlow.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap signup-form-wrap">
          <div className="mobile-brand brand">
            <span className="brand-icon"><Boxes size={23} /></span>
            <span>StockFlow</span>
          </div>

          <div className="auth-heading">
            <span className="eyebrow">GET STARTED</span>
            <h2>Create your account</h2>
            <p>Set up your owner account and shop workspace.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error" role="alert">{error}</div>}

            <label htmlFor="organizationName">Shop or business name</label>
            <div className="input-wrap">
              <Store size={18} />
              <input
                id="organizationName"
                name="organizationName"
                placeholder="e.g. Sunrise General Store"
                value={form.organizationName}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>

            <label htmlFor="name">Your full name</label>
            <div className="input-wrap">
              <UserRound size={18} />
              <input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>

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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                minLength={8}
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <p className="auth-legal">
            By creating an account, you create a separate inventory workspace
            for your business.
          </p>
        </div>
      </section>
    </main>
  );
}
