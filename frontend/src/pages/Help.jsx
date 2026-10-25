
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Settings,
  CircleHelp,
  Search,
  ChevronDown,
  Boxes,
  ShieldCheck,
  SlidersHorizontal,
  ArrowLeft,
} from "lucide-react";

const faqCategories = [
  {
    title: "Getting Started",
    icon: Boxes,
    questions: [
      {
        question: "What is StockFlow?",
        answer:
          "StockFlow is an inventory management application that helps you manage products, track quantities, and monitor low-stock items from one dashboard.",
      },
      {
        question: "How do I navigate StockFlow?",
        answer:
          "Use Dashboard to view inventory statistics, Products to manage inventory items, Settings to configure your organization, and Help Center to find answers to common questions.",
      },
    ],
  },
  {
    title: "Product Management",
    icon: Package,
    questions: [
      {
        question: "How do I add a product?",
        answer:
          "Open Products, select the option to add a product, enter the required details such as name, SKU, price, and quantity, then save the product.",
      },
      {
        question: "Can I edit or delete a product?",
        answer:
          "Yes. Open the Products page and use the edit or delete action associated with the product you want to manage. Review the details before saving or deleting.",
      },
      {
        question: "What happens if I use a duplicate SKU?",
        answer:
          "A SKU identifies a product within your organization. StockFlow should reject duplicate SKUs within the same organization so products remain identifiable.",
      },
    ],
  },
  {
    title: "Inventory and Dashboard",
    icon: SlidersHorizontal,
    questions: [
      {
        question: "What does low stock mean?",
        answer:
          "A product is considered low stock when its quantity is less than or equal to your organization's configured low-stock threshold.",
      },
      {
        question: "How do I change the low-stock threshold?",
        answer:
          "Open Settings, update the Low-stock threshold field to a non-negative whole number, and save your changes. The dashboard and product indicators can then use the updated threshold.",
      },
      {
        question: "What do the dashboard statistics mean?",
        answer:
          "Total Products counts your products, Total Units sums the quantities across those products, and Low-stock Items counts products whose quantities meet the low-stock rule.",
      },
    ],
  },
  {
    title: "Account and Security",
    icon: ShieldCheck,
    questions: [
      {
        question: "How do I log out?",
        answer:
          "Use the Logout option in the application navigation. You will need to log in again to access protected pages.",
      },
      {
        question: "Can another organization see my products?",
        answer:
          "StockFlow is designed to scope product and dashboard data to the authenticated user's organization. Keep your login credentials private and always log out on shared devices.",
      },
    ],
  },
];

export default function Help() {
  const [search, setSearch] = useState("");
  const [openQuestion, setOpenQuestion] = useState(null);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();

    return faqCategories
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (item) =>
            item.question.toLowerCase().includes(term) ||
            item.answer.toLowerCase().includes(term)
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [search]);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Boxes size={22} />
          </div>
          <div>
            <h2>StockFlow</h2>
            <span>Inventory Management</span>
          </div>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>

          <Link to="/products" className="nav-link">
            <Package size={19} />
            <span>Products</span>
          </Link>

          <Link to="/settings" className="nav-link">
            <Settings size={19} />
            <span>Settings</span>
          </Link>

          <Link to="/help" className="nav-link active">
            <CircleHelp size={19} />
            <span>Help & Support</span>
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help-card">
            <CircleHelp size={21} />
            <p>Need help managing your inventory?</p>
            <span>Search the FAQs for quick answers.</span>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <header className="dashboard-topbar">
          <div>
            <div className="breadcrumb">Workspace / Help Center</div>
            <h1>Help Center</h1>
          </div>

          <Link to="/dashboard" className="help-back-link">
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </header>

        <section className="help-page">
          <div className="help-hero">
            <div className="help-hero-icon">
              <CircleHelp size={30} />
            </div>

            <p className="help-eyebrow">STOCKFLOW SUPPORT</p>
            <h2>How can we help you?</h2>
            <p>
              Find answers about products, inventory, settings, and your account.
            </p>

            <div className="help-search">
              <Search size={20} />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setOpenQuestion(null);
                }}
                placeholder="Search your question..."
                aria-label="Search frequently asked questions"
              />
              {search && (
                <button
                  type="button"
                  className="help-clear"
                  onClick={() => setSearch("")}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="help-results-heading">
            <h2>Frequently asked questions</h2>
            <span>
              {filteredCategories.reduce(
                (total, category) => total + category.questions.length,
                0
              )}{" "}
              answers
            </span>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="help-empty">
              <Search size={30} />
              <h3>No answers found</h3>
              <p>Try another keyword, such as product, stock, or settings.</p>
              <button type="button" onClick={() => setSearch("")}>
                Clear search
              </button>
            </div>
          ) : (
            <div className="help-categories">
              {filteredCategories.map((category) => {
                const CategoryIcon = category.icon;

                return (
                  <section
                    className="help-category-card"
                    key={category.title}
                  >
                    <div className="help-category-heading">
                      <div className="help-category-icon">
                        <CategoryIcon size={20} />
                      </div>
                      <h3>{category.title}</h3>
                    </div>

                    <div className="help-faq-list">
                      {category.questions.map((item) => {
                        const questionId =
                          `${category.title}:${item.question}`;
                        const isOpen = openQuestion === questionId;

                        return (
                          <div className="help-faq-item" key={item.question}>
                            <button
                              type="button"
                              className="help-faq-question"
                              aria-expanded={isOpen}
                              onClick={() =>
                                setOpenQuestion(
                                  isOpen ? null : questionId
                                )
                              }
                            >
                              <span>{item.question}</span>
                              <ChevronDown
                                size={18}
                                className={isOpen ? "help-chevron-open" : ""}
                              />
                            </button>

                            {isOpen && (
                              <p className="help-faq-answer">
                                {item.answer}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
