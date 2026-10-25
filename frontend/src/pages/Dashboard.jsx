
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Boxes,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  LogOut,
  Menu,
  X,
  CircleHelp,
  Settings,
  Warehouse,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [organizationNameFromApi, setOrganizationNameFromApi] =
  useState("");
  const [organizationThreshold, setOrganizationThreshold] =
  useState(5);

const fetchDashboard = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await api.get("/dashboard");

    // Backend returns statistics inside response.data.statistics.
    setStats(response.data.statistics);

    // Use the organization's actual name and threshold.
    setOrganizationNameFromApi(
      response.data.organization?.name || "My Organization"
    );

    setOrganizationThreshold(
      Number(response.data.organization?.lowStockThreshold ?? 5)
    );
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Unable to load dashboard data. Please try again."
    );
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const organizationName =organizationNameFromApi ||user?.organization?.name ||
  user?.organizationName ||
  "My Organization";
  const totalProducts = Number(stats?.totalProducts ?? 0);
  const totalUnits = Number(stats?.totalUnits ?? 0);
  const lowStockItems = Number(stats?.lowStockItems ?? 0);
  const lowStockThreshold = organizationThreshold;

  const metrics = [
    {
      label: "Total products",
      value: totalProducts.toLocaleString(),
      description: "Products in your inventory",
      icon: Package,
      color: "blue",
    },
    {
      label: "Total units",
      value: totalUnits.toLocaleString(),
      description: "Units currently in stock",
      icon: Boxes,
      color: "purple",
    },
    {
      label: "Low-stock items",
      value: lowStockItems.toLocaleString(),
      description:
        lowStockItems > 0
          ? "Items need your attention"
          : "Your stock levels look good",
      icon: AlertTriangle,
      color: lowStockItems > 0 ? "orange" : "green",
    },
  ];

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
            className="nav-link active"
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
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-section-label">SUPPORT</div>
          <Link to="/help" className="nav-link">
          <Settings size={19} />
          <span>Help &amp; Support</span>
          </Link>
          <Link to="/settings" className="nav-link">
          <Settings size={19} />
          <span>Settings</span>
          </Link>

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
              <div className="breadcrumb">Workspace / Dashboard</div>
              <h1>Dashboard</h1>
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

        <div className="dashboard-content">
          <section className="welcome-section">
            <div>
              <div className="welcome-eyebrow">
                <span className="status-dot" />
                INVENTORY OVERVIEW
              </div>
              <h2>Welcome back, {user?.name?.split(" ")[0] || "there"}!</h2>
              <p>
                Here's what's happening with your inventory today.
              </p>
            </div>

            <button
              className="refresh-button"
              onClick={fetchDashboard}
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={loading ? "spin-icon" : ""}
              />
              <span>Refresh data</span>
            </button>
          </section>

          {error && (
            <div className="dashboard-error">
              <AlertTriangle size={19} />
              <span>{error}</span>
              <button onClick={fetchDashboard}>Try again</button>
            </div>
          )}

          <section className="metrics-grid">
            {metrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <article className="metric-card" key={metric.label}>
                  <div className="metric-card-top">
                    <div className={`metric-icon ${metric.color}`}>
                      <Icon size={21} />
                    </div>
                    <span className="metric-period">ALL TIME</span>
                  </div>

                  <div className="metric-label">{metric.label}</div>

                  <div className="metric-value">
                    {loading ? (
                      <span className="loading-value">---</span>
                    ) : (
                      metric.value
                    )}
                  </div>

                  <div className="metric-description">
                    {metric.description}
                  </div>
                </article>
              );
            })}
          </section>

          <section className="dashboard-lower-grid">
            <article className="overview-card">
              <div className="card-heading">
                <div>
                  <h3>Inventory health</h3>
                  <p>A quick look at your stock status</p>
                </div>
                <div className="heading-icon">
                  <TrendingUp size={20} />
                </div>
              </div>

              {loading ? (
                <div className="dashboard-loading">
                  Loading inventory health...
                </div>
              ) : (
                <>
                  <div className="health-summary">
                    <div
                      className={`health-indicator ${
                        lowStockItems > 0 ? "needs-attention" : ""
                      }`}
                    >
                      {lowStockItems > 0 ? (
                        <AlertTriangle size={23} />
                      ) : (
                        <Boxes size={23} />
                      )}
                    </div>

                    <div>
                      <strong>
                        {lowStockItems > 0
                          ? "Stock needs attention"
                          : "You're looking good"}
                      </strong>
                      <p>
                        {lowStockItems > 0
                          ? `${lowStockItems} product(s) are at or below your low-stock threshold.`
                          : "No products are currently below your stock threshold."}
                      </p>
                    </div>
                  </div>

                  <div className="threshold-row">
                    <span>Low-stock threshold</span>
                    <strong>{lowStockThreshold} units</strong>
                  </div>

                  <div className="threshold-note">
                    Products with quantities at or below this value are
                    counted as low stock.
                  </div>
                </>
              )}
            </article>

            <article className="quick-actions-card">
              <div className="card-heading">
                <div>
                  <h3>Quick actions</h3>
                  <p>Manage your inventory efficiently</p>
                </div>
              </div>

              <Link to="/products" className="quick-action">
                <div className="quick-action-icon">
                  <Package size={20} />
                </div>
                <div className="quick-action-text">
                  <strong>Manage products</strong>
                  <span>View and update your inventory</span>
                </div>
                <ArrowUpRight size={19} className="quick-action-arrow" />
              </Link>

              <Link to="/products" className="quick-action">
                <div className="quick-action-icon add-product-icon">
                  <Boxes size={20} />
                </div>
                <div className="quick-action-text">
                  <strong>Review stock levels</strong>
                  <span>Check quantities and product details</span>
                </div>
                <ArrowUpRight size={19} className="quick-action-arrow" />
              </Link>
            </article>
          </section>

          <footer className="dashboard-footer">
            <span>© {new Date().getFullYear()} StockFlow</span>
            <span>Inventory management made simple.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
