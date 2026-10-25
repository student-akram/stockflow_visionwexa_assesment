
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Settings as SettingsIcon,
  Warehouse,
  LogOut,
  Menu,
  X,
  Save,
  RefreshCw,
  Building2,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Settings() {
  const { user, logout } = useAuth();

  const [form, setForm] = useState({
    name: "",
    lowStockThreshold: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [originalForm, setOriginalForm] = useState({
    name: "",
    lowStockThreshold: 5,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/organization/settings");
        const organization = response.data.organization;

        const settings = {
          name: organization.name || "",
          lowStockThreshold: organization.lowStockThreshold ?? 5,
        };

        setForm(settings);
        setOriginalForm(settings);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load organization settings."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const threshold = Number(form.lowStockThreshold);

    if (!name) {
      setError("Organization name is required.");
      return;
    }

    if (name.length > 100) {
      setError("Organization name cannot exceed 100 characters.");
      return;
    }

    if (
      String(form.lowStockThreshold).trim() === "" ||
      !Number.isInteger(threshold) ||
      threshold < 0
    ) {
      setError("Threshold must be a whole number of zero or more.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/organization/settings", {
        name,
        lowStockThreshold: threshold,
      });

      const organization = response.data.organization;

      const updatedSettings = {
        name: organization.name,
        lowStockThreshold: organization.lowStockThreshold,
      };

      setForm(updatedSettings);
      setOriginalForm(updatedSettings);
      setSuccess("Organization settings saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(originalForm);
    setError("");
    setSuccess("");
  };

  const handleLogout = () => {
    logout();
    window.location.assign("/login");
  };

  const organizationName =
    form.name || user?.organization?.name || user?.organizationName ||
    "My Organization";

  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`app-sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Warehouse size={22} />
          </div>
          <div>
            <h2>StockFlow</h2>
            <span>Inventory management</span>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/products"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Package size={19} />
            <span>Products</span>
          </Link>

          <Link
            to="/settings"
            className="nav-link active"
            onClick={() => setMobileMenuOpen(false)}
          >
            <SettingsIcon size={19} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-section-label">ACCOUNT</div>

          <div className="sidebar-organization">
            <div className="organization-avatar">
              {organizationName.charAt(0).toUpperCase()}
            </div>
            <div className="organization-info">
              <strong>{organizationName}</strong>
              <span>Organization workspace</span>
            </div>
          </div>

          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>
            <div>
              <div className="breadcrumb">Workspace / Settings</div>
              <h1>Settings</h1>
            </div>
          </div>

          <div className="topbar-user">
            <div className="user-avatar">
              {(user?.name || user?.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="topbar-user-info">
              <strong>{user?.name || "User"}</strong>
              <span>Workspace owner</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content settings-content">
          <section className="welcome-section">
            <div>
              <div className="welcome-eyebrow">
                <span className="status-dot" />
                WORKSPACE CONFIGURATION
              </div>
              <h2>Organization settings</h2>
              <p>
                Customize your workspace and control when products are marked
                as low stock.
              </p>
            </div>
          </section>

          {error && (
            <div className="settings-message settings-message-error" role="alert">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="settings-message settings-message-success" role="status">
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <section className="settings-card">
              <div className="settings-card-heading">
                <div className="settings-heading-icon">
                  <Building2 size={21} />
                </div>
                <div>
                  <h3>Organization information</h3>
                  <p>Manage the name displayed across your workspace.</p>
                </div>
              </div>

              <div className="settings-form-field">
                <label htmlFor="organization-name">Organization name</label>
                <input
                  id="organization-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter organization name"
                  maxLength={100}
                  disabled={loading || saving}
                  required
                />
                <small>Maximum 100 characters.</small>
              </div>
            </section>

            <section className="settings-card">
              <div className="settings-card-heading">
                <div className="settings-heading-icon threshold-heading-icon">
                  <SlidersHorizontal size={21} />
                </div>
                <div>
                  <h3>Inventory preferences</h3>
                  <p>Choose when your products should be flagged as low stock.</p>
                </div>
              </div>

              <div className="settings-form-field">
                <label htmlFor="low-stock-threshold">
                  Low-stock threshold (units)
                </label>
                <input
                  id="low-stock-threshold"
                  name="lowStockThreshold"
                  type="number"
                  min="0"
                  step="1"
                  value={form.lowStockThreshold}
                  onChange={handleChange}
                  disabled={loading || saving}
                  required
                />
                <small>
                  Products with a quantity less than or equal to this number
                  will be marked as low stock.
                </small>
              </div>

              <div className="threshold-preview">
                <div className="threshold-preview-icon">
                  <Package size={20} />
                </div>
                <div>
                  <strong>Current rule</strong>
                  <p>
                    Products with {Number(form.lowStockThreshold) || 0} units
                    or fewer are considered low stock.
                  </p>
                </div>
              </div>
            </section>

            <div className="settings-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={handleReset}
                disabled={loading || saving}
              >
                Reset changes
              </button>

              <button
                type="submit"
                className="primary-action"
                disabled={loading || saving}
              >
                {saving ? (
                  <RefreshCw size={16} className="spin-icon" />
                ) : (
                  <Save size={17} />
                )}
                {loading
                  ? "Loading..."
                  : saving
                    ? "Saving..."
                    : "Save settings"}
              </button>
            </div>
          </form>

          <footer className="dashboard-footer">
            <span>© {new Date().getFullYear()} StockFlow</span>
            <span>Inventory management made simple.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
