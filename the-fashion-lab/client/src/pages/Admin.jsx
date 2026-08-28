import React, { useEffect, useState } from "react";
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

export default function Admin({ user }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [f, setF] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setProducts(await api("/products"));
      setOrders(await api("/orders"));
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
          Sign in with the administrator account to manage the store.
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

  return (
    <main className="page">

      <p className="eyebrow">
        STORE CONTROL
      </p>

      <h1>
        Admin dashboard.
      </h1>

      {err && (
        <p className="error">
          {err}
        </p>
      )}

      {/* STATS */}

      <div className="admin-stats">

        <div className="admin-stat">
          <span>PRODUCTS</span>
          <strong>{products.length}</strong>
          <small>Listed in store</small>
        </div>

        <div className="admin-stat">
          <span>ORDERS</span>
          <strong>{orders.length}</strong>
          <small>Total orders</small>
        </div>

        <div className="admin-stat">
          <span>PENDING</span>
          <strong>
            {
              orders.filter(
                (o) => o.status === "pending"
              ).length
            }
          </strong>
          <small>Need attention</small>
        </div>

        <div className="admin-stat">
          <span>REVENUE</span>

          <strong>
            ₹{revenue.toLocaleString("en-IN")}
          </strong>

          <small>
            Order value
          </small>
        </div>

      </div>

      {/* MAIN ADMIN AREA */}

      <div className="admin-grid">

        {/* PRODUCT FORM */}

        <form
          className="form-card"
          onSubmit={save}
        >

          <div className="admin-form-head">

            <h2>
              {editing
                ? "Edit product"
                : "Add product"}
            </h2>

            {editing && (
              <button
                type="button"
                className="switch"
                onClick={() => {
                  setEditing(null);
                  setF(empty);
                }}
              >
                Cancel edit
              </button>
            )}

          </div>

          {[
            ["name", "Product name"],
            ["price", "Price"],
            ["old_price", "Original price"],
            ["image", "Image URL"],
            ["size", "Size"],
            ["stock", "Stock"]
          ].map(([key, placeholder]) => (
            <input
              key={key}
              required={key !== "old_price"}
              type={
                key.includes("price") ||
                key === "stock"
                  ? "number"
                  : "text"
              }
              placeholder={placeholder}
              value={f[key]}
              onChange={(e) =>
                change(key, e.target.value)
              }
            />
          ))}

          <textarea
            placeholder="Description"
            value={f.description}
            onChange={(e) =>
              change(
                "description",
                e.target.value
              )
            }
          />

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

          <button
            disabled={busy}
            className="button dark"
          >
            {busy
              ? "SAVING..."
              : editing
              ? "SAVE CHANGES"
              : "ADD PRODUCT"}
          </button>

        </form>

        {/* PRODUCTS + ORDERS */}

        <section>

          <div className="admin-section-head">
            <h2>
              Products ({products.length})
            </h2>
          </div>

          {products.map((p) => (
            <div
              className="admin-row expanded"
              key={p.id}
            >

              <div className="admin-product-info">

                <img
                  src={p.image}
                  alt={p.name}
                  className="admin-product-image"
                />

                <div>

                  <b>
                    {p.name}
                  </b>

                  <span>
                    ₹{Number(p.price).toLocaleString("en-IN")}
                    {" · "}
                    {p.category}
                    {" · "}
                    {p.size}
                  </span>

                  <small
                    className={
                      Number(p.stock) === 0
                        ? "stock-sold"
                        : Number(p.stock) <= 2
                        ? "stock-low"
                        : "stock-good"
                    }
                  >
                    {Number(p.stock) === 0
                      ? "SOLD OUT"
                      : Number(p.stock) <= 2
                      ? `LOW STOCK · ${p.stock} LEFT`
                      : `IN STOCK · ${p.stock} AVAILABLE`}
                  </small>

                </div>

              </div>

              <div className="row-actions">

                <button
                  type="button"
                  onClick={() => edit(p)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    remove(p.id)
                  }
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

          {/* ORDERS */}

          <h2 className="orders-title">
            Orders ({orders.length})
          </h2>

          {orders.map((o) => (
            <div
              className="admin-row expanded"
              key={o.id}
            >

              <div>

                <b>
                  #{o.id} · {o.name}
                </b>

                <span>
                  {o.email}
                  {" · "}
                  ₹{Number(o.total).toLocaleString("en-IN")}
                  {" · "}
                  {new Date(
                    o.created_at
                  ).toLocaleDateString("en-IN")}
                </span>

              </div>

              <select
  value={o.status}
  onChange={(e) =>
    status(o.id, e.target.value)
  }
  disabled={o.status === "cancelled"}
>
  <option value="pending">
    pending
  </option>

  <option value="processing">
    processing
  </option>

  <option value="shipped">
    shipped
  </option>

  <option value="delivered">
    delivered
  </option>

  <option value="cancelled">
    cancelled
  </option>
</select>
                <option value="pending">
                  pending
                </option>

                <option value="processing">
                  processing
                </option>

                <option value="shipped">
                  shipped
                </option>

                <option value="delivered">
                  delivered
                </option>

                <option value="cancelled">
                  cancelled
                </option>
              </select>

            </div>
          ))}

        </section>

      </div>

    </main>
  );
}
