
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  LogOut,
  Menu,
  Warehouse,
  RefreshCw,
  AlertTriangle,
  CircleHelp,
  Settings,
  ArrowUpDown,
  PackageOpen,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const emptyForm = {
  name: "",
  sku: "",
  description: "",
  quantity: "0",
  price: "",
};

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    "Something went wrong. Please try again."
  );
}

export default function Products() {
  const { user, logout } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const organizationName =
    user?.organization?.name || user?.organizationName || "My Organization";

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setPageError("");

      const response = await api.get("/products");
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : Array.isArray(data.data)
            ? data.data
            : null;

      if (!list) {
        throw new Error("The products API returned an unexpected response.");
      }

      setProducts(list);
    } catch (error) {
      setPageError(
        error.message ===
          "The products API returned an unexpected response."
          ? error.message
          : getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  useEffect(() => {
  const fetchThreshold = async () => {
    try {
      const response = await api.get("/dashboard");

      const threshold = Number(response.data.lowStockThreshold);

      if (Number.isFinite(threshold) && threshold >= 0) {
        setLowStockThreshold(threshold);
      }
    } catch (error) {
      console.error("Unable to load stock threshold:", error);
    }
  };

  fetchThreshold();
}, []);
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const name = String(product.name || "").toLowerCase();
      const sku = String(product.sku || "").toLowerCase();
      const description = String(product.description || "").toLowerCase();

      return (
        !term ||
        name.includes(term) ||
        sku.includes(term) ||
        description.includes(term)
      );
    });

    return result.sort((a, b) => {
      if (sortBy === "name") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      if (sortBy === "quantity") {
        return Number(a.quantity || 0) - Number(b.quantity || 0);
      }

      if (sortBy === "price") {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [products, search, sortBy]);

  const totalUnits = products.reduce(
    (total, product) => total + Number(product.quantity || 0),
    0
  );

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError("");
    setNotice(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      quantity: String(product.quantity ?? 0),
      price: String(product.price ?? ""),
    });
    setFormError("");
    setNotice(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingProduct(null);
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setNotice(null);

    const quantity = Number(form.quantity);
    const price = Number(form.price);

    if (!form.name.trim() || !form.sku.trim()) {
      setFormError("Product name and SKU are required.");
      return;
    }

    if (
      form.quantity.trim() === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setFormError("Quantity must be a whole number of zero or more.");
      return;
    }

    if (
      form.price.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setFormError("Enter a valid price of zero or more.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim(),
      quantity,
      price,
    };

    try {
      setSaving(true);

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        setNotice({
          type: "success",
          text: "Product updated successfully.",
        });
      } else {
        await api.post("/products", payload);
        setNotice({
          type: "success",
          text: "Product added successfully.",
        });
      }

      setModalOpen(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(product.id);
    setNotice(null);
    setPageError("");

    try {
      await api.delete(`/products/${product.id}`);

      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id)
      );

      setNotice({
        type: "success",
        text: `${product.name} was deleted successfully.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: getErrorMessage(error),
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.assign("/login");
  };

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
            className="nav-link active"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Package size={19} />
            <span>Products</span>
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-section-label">SUPPORT</div>

          <Link to="/help" className="nav-link" onClick={() => setMobileMenuOpen(false)}
>
  <CircleHelp size={19} />
  <span>Help &amp; Support</span>
</Link>
          <Link
            to="/settings"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
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
              <div className="breadcrumb">Workspace / Products</div>
              <h1>Products</h1>
            </div>
          </div>

          <div className="topbar-user">
            <div className="user-avatar">
             {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="topbar-user-info">
              <strong>{user?.name || "User"}</strong>
              <span>Workspace owner</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content products-content">
          <section className="welcome-section">
            <div>
              <div className="welcome-eyebrow">
                <span className="status-dot" />
                INVENTORY MANAGEMENT
              </div>
              <h2>Your products</h2>
              <p>
                Manage product details, monitor stock levels, and keep your
                inventory organized.
              </p>
            </div>

            <button className="primary-action" onClick={openCreateModal}>
              <Plus size={18} />
              Add product
            </button>
          </section>

          {notice && (
            <div
              className={`product-notice ${
                notice.type === "error" ? "notice-error" : "notice-success"
              }`}
              role="status"
            >
              {notice.type === "error" ? (
                <AlertTriangle size={18} />
              ) : (
                <Package size={18} />
              )}
              <span>{notice.text}</span>
              <button
                onClick={() => setNotice(null)}
                aria-label="Dismiss message"
              >
                <X size={17} />
              </button>
            </div>
          )}

          <section className="product-summary-grid">
            <article className="product-summary-card">
              <div className="product-summary-icon">
                <Package size={20} />
              </div>
              <div>
                <span>Total products</span>
                <strong>{loading ? "—" : products.length.toLocaleString()}</strong>
              </div>
            </article>

            <article className="product-summary-card">
              <div className="product-summary-icon units-summary-icon">
                <Boxes size={20} />
              </div>
              <div>
                <span>Total units</span>
                <strong>{loading ? "—" : totalUnits.toLocaleString()}</strong>
              </div>
            </article>
          </section>

          <section className="products-table-card">
            <div className="products-toolbar">
              <div>
                <h3>Inventory list</h3>
                <p>All products belonging to your organization</p>
                <p className="products-threshold-note">
                  Low stock: {lowStockThreshold} units or fewer
                </p>
              </div>

              <div className="products-toolbar-controls">
                <label className="product-search">
                  <Search size={17} />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name or SKU..."
                    aria-label="Search products"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </label>

                <label className="product-sort">
                  <ArrowUpDown size={15} />
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    aria-label="Sort products"
                  >
                    <option value="newest">Newest</option>
                    <option value="name">Name A–Z</option>
                    <option value="quantity">Lowest stock</option>
                    <option value="price">Highest price</option>
                  </select>
                </label>

                <button
                  className="icon-refresh-button"
                  onClick={fetchProducts}
                  disabled={loading}
                  aria-label="Refresh products"
                  title="Refresh products"
                >
                  <RefreshCw size={17} />
                </button>
              </div>
            </div>

            {pageError && (
              <div className="products-error">
                <AlertTriangle size={19} />
                <span>{pageError}</span>
                <button onClick={fetchProducts}>Try again</button>
              </div>
            )}

            {loading ? (
              <div className="products-empty-state">
                <RefreshCw className="spin-icon" size={25} />
                <strong>Loading your products...</strong>
                <p>Please wait while we fetch your inventory.</p>
              </div>
            ) : !pageError && filteredProducts.length === 0 ? (
              <div className="products-empty-state">
                <div className="empty-products-icon">
                  <PackageOpen size={29} />
                </div>
                <strong>
                  {search ? "No matching products" : "No products yet"}
                </strong>
                <p>
                  {search
                    ? "Try another name or SKU."
                    : "Add your first product to start managing your inventory."}
                </p>
                {!search && (
                  <button
                    className="primary-action"
                    onClick={openCreateModal}
                  >
                    <Plus size={17} />
                    Add your first product
                  </button>
                )}
              </div>
            ) : !pageError ? (
              <div className="products-table-scroll">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>SKU</th>
                      <th>PRICE</th>
                      <th>QUANTITY</th>
                      <th>STOCK STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const quantity = Number(product.quantity || 0);
                      const isLowStock = quantity <= lowStockThreshold;

                      return (
                        <tr key={product.id}>
                          <td>
                            <div className="product-name-cell">
                              <div className="product-row-icon">
                                <Package size={18} />
                              </div>
                              <div>
                                <strong>{product.name}</strong>
                                <span>
                                  {product.description || "No description"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="sku-chip">
                              {product.sku}
                            </span>
                          </td>

                          <td className="product-price">
                            {Number(product.price || 0).toLocaleString(
                              "en-IN",
                              {
                                style: "currency",
                                currency: "INR",
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>

                          <td>
                            <strong className="quantity-value">
                              {quantity.toLocaleString()}
                            </strong>
                            <span className="units-label"> units</span>
                          </td>

                          <td>
                            <span
                              className={`stock-badge ${
                                isLowStock ? "stock-low" : "stock-healthy"
                              }`}
                            >
                              <span />
                              {isLowStock ? "Low stock" : "In stock"}
                            </span>
                          </td>

                          <td>
                            <div className="product-row-actions">
                              <button
                                className="row-action edit-action"
                                onClick={() => openEditModal(product)}
                                aria-label={`Edit ${product.name}`}
                                title="Edit product"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                className="row-action delete-action"
                                onClick={() => handleDelete(product)}
                                disabled={deletingId === product.id}
                                aria-label={`Delete ${product.name}`}
                                title="Delete product"
                              >
                                {deletingId === product.id ? (
                                  <RefreshCw
                                    size={16}
                                    className="spin-icon"
                                  />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}

            {!loading && !pageError && filteredProducts.length > 0 && (
              <div className="products-table-footer">
                <span>
                  Showing {filteredProducts.length} of {products.length}{" "}
                  products
                </span>
                <span>Inventory data is organization-specific</span>
              </div>
            )}
          </section>

          <footer className="dashboard-footer">
            <span>© {new Date().getFullYear()} StockFlow</span>
            <span>Inventory management made simple.</span>
          </footer>
        </div>
      </main>

      {modalOpen && (
        <div
          className="product-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            <div className="product-modal-header">
              <div>
                <div className="modal-icon">
                  {editingProduct ? (
                    <Pencil size={20} />
                  ) : (
                    <Plus size={21} />
                  )}
                </div>
                <h2 id="product-modal-title">
                  {editingProduct ? "Edit product" : "Add a product"}
                </h2>
                <p>
                  {editingProduct
                    ? "Update the information for this product."
                    : "Enter the details of the product you want to track."}
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form className="product-form" onSubmit={handleSubmit}>
              <label className="product-form-field">
                <span>Product name *</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Wireless Keyboard"
                  maxLength={150}
                  required
                />
              </label>

              <label className="product-form-field">
                <span>SKU (Stock Keeping Unit) *</span>
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleFormChange}
                  placeholder="e.g. KEY-001"
                  maxLength={100}
                  required
                />
                <small>Each product must have a unique SKU in your organization.</small>
              </label>

              <label className="product-form-field">
                <span>Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="A short description of this product"
                  rows={3}
                  maxLength={1000}
                />
              </label>

              <div className="product-form-two-columns">
                <label className="product-form-field">
                  <span>Quantity *</span>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleFormChange}
                    min="0"
                    step="1"
                    required
                  />
                </label>

                <label className="product-form-field">
                  <span>Price (₹) *</span>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </label>
              </div>

              {formError && (
                <div className="form-error-message" role="alert">
                  <AlertTriangle size={17} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="product-form-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-action"
                  disabled={saving}
                >
                  {saving && <RefreshCw size={16} className="spin-icon" />}
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Save changes"
                      : "Create product"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
