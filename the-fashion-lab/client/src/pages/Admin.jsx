import React, { useEffect, useState } from "react";
import {
  Package,
  ShoppingBag,
  IndianRupee,
  Clock3,
  Pencil,
  Trash2,
  Truck,
  CheckCircle2,
  XCircle,
  UserRound,
  MapPin
} from "lucide-react";
import { api } from "../api";

const empty = {
  name: "",
  description: "",
  category: "Vintage",
  gender: "Unisex",
  size: "M",
  condition: "Excellent",
  price: "",
  old_price: "",
  image: "",
  stock: 1
};

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

function StatusBadge({ status }) {
  const icons = {
    pending: Clock3,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle2,
    cancelled: XCircle
  };

  const Icon = icons[status] || Clock3;

  return (
    <span className={`admin-status status-${status}`}>
      <Icon size={14} />
      {status}
    </span>
  );
}

function OrderProgress({ status }) {
  if (status === "cancelled") {
    return (
      <div className="admin-cancelled">
        <XCircle size={18} />
        Order cancelled
      </div>
    );
  }

  const steps = [
    ["pending", "Placed"],
    ["processing", "Processing"],
    ["shipped", "Shipped"],
    ["delivered", "Delivered"]
  ];

  const current = steps.findIndex(
    ([key]) => key === status
  );

  return (
    <div className="admin-progress">

      {steps.map(([key, label], index) => (

        <React.Fragment key={key}>

          <div
            className={
              index <= current
                ? "progress-item active"
                : "progress-item"
            }
          >
            <div className="progress-dot">
              {index < current ? (
                <CheckCircle2 size={14} />
              ) : (
                index + 1
              )}
            </div>

            <span>{label}</span>
          </div>

          {index < steps.length - 1 && (
            <div
              className={
                index < current
                  ? "progress-line active"
                  : "progress-line"
              }
            />
          )}

        </React.Fragment>

      ))}

    </div>
  );
}

export default function Admin({ user }) {

  const [products, setProducts] = useState([]);
const [orders, setOrders] = useState([]);

const [productSearch, setProductSearch] = useState("");
const [productCategory, setProductCategory] = useState("All");
const [stockFilter, setStockFilter] = useState("All");

const [f, setF] = useState(empty);
  const [editing, setEditing] = useState(null);

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setErr("");

      const [productData, orderData] =
        await Promise.all([
          api("/products"),
          api("/orders")
        ]);

      setProducts(productData);
      setOrders(orderData);

    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    if (user?.role === "admin") {
      load();
    }
  }, [user]);

  if (user?.role !== "admin") {
    return (
      <main className="page">
        <h1>Admin access required.</h1>

        <p className="muted">
          Sign in with the administrator account
          to manage the store.
        </p>
      </main>
    );
  }

  const change = (key, value) => {
    setF((x) => ({
      ...x,
      [key]: value
    }));
  };

  async function save(e) {
    e.preventDefault();

    setBusy(true);
    setErr("");

    try {

      const body = {
        ...f,
        price: Number(f.price),
        old_price: f.old_price
          ? Number(f.old_price)
          : null,
        stock: Number(f.stock)
      };

      if (editing) {

        await api(`/products/${editing}`, {
          method: "PATCH",
          body: JSON.stringify(body)
        });

      } else {

        await api("/products", {
          method: "POST",
          body: JSON.stringify(body)
        });

      }

      setF(empty);
      setEditing(null);

      await load();

    } catch (e) {
      setErr(e.message);

    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {

    if (!confirm("Delete this product?")) {
      return;
    }

    try {

      await api(`/products/${id}`, {
        method: "DELETE"
      });

      await load();

    } catch (e) {
      setErr(e.message);
    }
  }

  function edit(p) {

    setEditing(p.id);

    setF({
      ...p,
      old_price: p.old_price || ""
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  async function status(id, newStatus) {

    try {

      await api(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus
        })
      });

      await load();

    } catch (e) {
      setErr(e.message);
    }
  }

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce(
      (sum, o) => sum + Number(o.total || 0),
      0
    );

  const pending = orders.filter(
    (o) => o.status === "pending"
  ).length;
const filteredProducts = products.filter((p) => {
  const search = productSearch.toLowerCase().trim();

  const matchesSearch =
    !search ||
    `${p.name} ${p.category} ${p.gender} ${p.size}`
      .toLowerCase()
      .includes(search);

  const matchesCategory =
    productCategory === "All" ||
    p.category === productCategory;

  const stock = Number(p.stock || 0);

  const matchesStock =
    stockFilter === "All" ||
    (stockFilter === "In Stock" && stock > 0) ||
    (stockFilter === "Low Stock" && stock > 0 && stock <= 2) ||
    (stockFilter === "Sold Out" && stock === 0);

  return (
    matchesSearch &&
    matchesCategory &&
    matchesStock
  );
});
  const delivered = orders.filter(
    (o) => o.status === "delivered"
  ).length;

  return (
    <main className="admin-page">

      {/* HEADER */}

      <section className="admin-header">

        <div>
          <p className="eyebrow">
            THE FASHION LAB · CONTROL CENTER
          </p>

          <h1>
            Admin Dashboard
          </h1>

          <p className="admin-subtitle">
            Manage products, orders and your
            fashion store from one place.
          </p>
        </div>

        <div className="admin-user">

          <div className="admin-user-icon">
            <UserRound size={20} />
          </div>

          <div>
            <strong>{user.name}</strong>
            <span>Administrator</span>
          </div>

        </div>

      </section>


      {/* ERROR */}

      {err && (
        <div className="admin-error">
          <XCircle size={18} />
          {err}
        </div>
      )}


      {/* STATS */}

      <section className="admin-stats">

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            <ShoppingBag size={20} />
          </div>

          <div>
            <span>ORDERS</span>
            <strong>{orders.length}</strong>
            <small>Total orders</small>
          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            <Clock3 size={20} />
          </div>

          <div>
            <span>PENDING</span>
            <strong>{pending}</strong>
            <small>Need attention</small>
          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            <Package size={20} />
          </div>

          <div>
            <span>PRODUCTS</span>
            <strong>{products.length}</strong>
            <small>Listed products</small>
          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            <IndianRupee size={20} />
          </div>

          <div>
            <span>REVENUE</span>
            <strong>{money(revenue)}</strong>
            <small>Order value</small>
          </div>

        </div>

      </section>


      {/* PRODUCT AREA */}

      <section className="admin-content">

        <div className="admin-form-panel">

          <div className="admin-panel-header">

            <div>
              <p className="eyebrow">
                INVENTORY
              </p>

              <h2>
                {editing
                  ? "Edit Product"
                  : "Add Product"}
              </h2>
            </div>

            {editing && (
              <button
                type="button"
                className="admin-text-button"
                onClick={() => {
                  setEditing(null);
                  setF(empty);
                }}
              >
                Cancel
              </button>
            )}

          </div>


          <form
            className="admin-product-form"
            onSubmit={save}
          >

            <label>
              PRODUCT NAME

              <input
                required
                placeholder="e.g. Vintage Denim Jacket"
                value={f.name}
                onChange={(e) =>
                  change("name", e.target.value)
                }
              />
            </label>


            <label>
              IMAGE URL

              <input
                required
                placeholder="https://..."
                value={f.image}
                onChange={(e) =>
                  change("image", e.target.value)
                }
              />
            </label>


            <div className="admin-two">

              <label>
                PRICE

                <input
                  required
                  type="number"
                  min="0"
                  value={f.price}
                  onChange={(e) =>
                    change("price", e.target.value)
                  }
                />
              </label>


              <label>
                ORIGINAL PRICE

                <input
                  type="number"
                  min="0"
                  value={f.old_price}
                  onChange={(e) =>
                    change(
                      "old_price",
                      e.target.value
                    )
                  }
                />
              </label>

            </div>


            <div className="admin-two">

              <label>
                SIZE

                <input
                  required
                  value={f.size}
                  onChange={(e) =>
                    change("size", e.target.value)
                  }
                />
              </label>


              <label>
                STOCK

                <input
                  required
                  type="number"
                  min="0"
                  value={f.stock}
                  onChange={(e) =>
                    change("stock", e.target.value)
                  }
                />
              </label>

            </div>


            <div className="admin-two">

              <label>
                CATEGORY

                <select
                  value={f.category}
                  onChange={(e) =>
                    change(
                      "category",
                      e.target.value
                    )
                  }
                >
                  <option>Vintage</option>
                  <option>Streetwear</option>
                  <option>Casual</option>
                </select>
              </label>


              <label>
                GENDER

                <select
                  value={f.gender}
                  onChange={(e) =>
                    change(
                      "gender",
                      e.target.value
                    )
                  }
                >
                  <option>Unisex</option>
                  <option>Men</option>
                  <option>Women</option>
                </select>
              </label>

            </div>


            <label>
              CONDITION

              <select
                value={f.condition}
                onChange={(e) =>
                  change(
                    "condition",
                    e.target.value
                  )
                }
              >
                <option>Excellent</option>
                <option>Very Good</option>
                <option>Good</option>
              </select>
            </label>


            <label>
              DESCRIPTION

              <textarea
                placeholder="Describe the product..."
                value={f.description}
                onChange={(e) =>
                  change(
                    "description",
                    e.target.value
                  )
                }
              />

            </label>


            <button
              disabled={busy}
              className="admin-save-button"
            >
              {busy
                ? "SAVING..."
                : editing
                ? "SAVE CHANGES"
                : "ADD PRODUCT"}
            </button>

          </form>

        </div>


        {/* PRODUCT LIST */}

        <div className="admin-products-panel">

          <div className="admin-panel-header">

            <div>
              <p className="eyebrow">
                YOUR COLLECTION
              </p>

              <h2>
                Products
                <span>
                  {products.length}
                </span>
              </h2>
            </div>

          </div>


         <div className="admin-product-controls">

  <input
    type="search"
    placeholder="Search products..."
    value={productSearch}
    onChange={(e) =>
      setProductSearch(e.target.value)
    }
  />

  <select
    value={productCategory}
    onChange={(e) =>
      setProductCategory(e.target.value)
    }
  >
    <option value="All">All Categories</option>
    <option value="Vintage">Vintage</option>
    <option value="Streetwear">Streetwear</option>
    <option value="Casual">Casual</option>
  </select>

  <select
    value={stockFilter}
    onChange={(e) =>
      setStockFilter(e.target.value)
    }
  >
    <option value="All">All Stock</option>
    <option value="In Stock">In Stock</option>
    <option value="Low Stock">Low Stock</option>
    <option value="Sold Out">Sold Out</option>
  </select>

</div>

<div className="admin-product-results">
  Showing {filteredProducts.length} of {products.length} products
</div>

<div className="admin-product-list">
{filteredProducts.length === 0 ? (
  <div className="admin-empty">
    <ShoppingBag size={28} />
    <h3>No products found</h3>
    <p>
      Try changing your search or filters.
    </p>
  </div>
) : (
  filteredProducts.map((p) => (
  

              <article
                className="admin-product-card"
                key={p.id}
              >
{/* existing product card */}
      </article>
    ))
  )}

</div>
                <img
                  src={p.image}
                  alt={p.name}
                />

                <div className="admin-product-details">

                  <div className="admin-product-title">

                    <h3>{p.name}</h3>

                    <span>
                      {p.category} · {p.size}
                    </span>

                  </div>


                  <strong className="admin-product-price">
                    {money(p.price)}
                  </strong>


                  <small
                    className={
                      Number(p.stock) === 0
                        ? "stock sold"
                        : Number(p.stock) <= 2
                        ? "stock low"
                        : "stock good"
                    }
                  >
                    {Number(p.stock) === 0
                      ? "SOLD OUT"
                      : Number(p.stock) <= 2
                      ? `ONLY ${p.stock} LEFT`
                      : `${p.stock} IN STOCK`}
                  </small>


                  <div className="admin-product-actions">

                    <button
                      onClick={() => edit(p)}
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      className="delete"
                      onClick={() =>
                        remove(p.id)
                      }
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        </div>

      </section>


      {/* ORDERS */}

      <section className="admin-orders">

        <div className="admin-orders-header">

          <div>
            <p className="eyebrow">
              ORDER MANAGEMENT
            </p>

            <h2>
              Customer Orders
            </h2>
          </div>

          <div className="orders-summary">
            {delivered} delivered
          </div>

        </div>


        <div className="admin-order-list">

          {!orders.length ? (

            <div className="admin-empty">
              <ShoppingBag size={32} />
              <h3>No orders yet</h3>
              <p>
                Customer orders will appear here.
              </p>
            </div>

          ) : (

            orders.map((o) => (

              <article
                className="admin-order-card"
                key={o.id}
              >

                <div className="order-card-top">

                  <div className="admin-order-number">

                    <div className="admin-order-icon">
                      <Package size={19} />
                    </div>

                    <div>
                      <span>ORDER</span>

                      <strong>
                        #{o.id}
                      </strong>

                      <small>
                        {new Date(
                          o.created_at
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          }
                        )}
                      </small>
                    </div>

                  </div>


                  <StatusBadge
                    status={o.status}
                  />

                </div>


                <div className="admin-order-info">

                  <div>
                    <UserRound size={16} />

                    <span>
                      <small>CUSTOMER</small>
                      <strong>{o.name}</strong>
                      <em>{o.email}</em>
                    </span>
                  </div>


                  <div>
                    <MapPin size={16} />

                    <span>
                      <small>DELIVERY ADDRESS</small>
                      <strong>
                        {o.shipping_address ||
                          "Address not available"}
                      </strong>
                    </span>
                  </div>


                  <div>
                    <IndianRupee size={16} />

                    <span>
                      <small>ORDER TOTAL</small>
                      <strong>
                        {money(o.total)}
                      </strong>
                    </span>
                  </div>

                </div>


                <OrderProgress
                  status={o.status}
                />


                <div className="admin-order-footer">

                  <span>
                    UPDATE ORDER
                  </span>

                  <select
                    value={o.status}
                    onChange={(e) =>
                      status(
                        o.id,
                        e.target.value
                      )
                    }
                  >
                    <option value="pending">
                      Pending
                    </option>

                    <option value="processing">
                      Processing
                    </option>

                    <option value="shipped">
                      Shipped
                    </option>

                    <option value="delivered">
                      Delivered
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>

                </div>

              </article>

            ))

          )}

        </div>

      </section>

    </main>
  );
}
