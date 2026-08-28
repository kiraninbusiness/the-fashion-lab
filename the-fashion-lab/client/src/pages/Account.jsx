import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  LogOut,
  Package,
  ShoppingBag,
  UserRound,
  Truck,
  CheckCircle,
  XCircle
} from "lucide-react";
import { api } from "../api";

const money = (n) =>
  `₹${Number(n).toLocaleString("en-IN")}`;

const trackingSteps = [
  "pending",
  "processing",
  "shipped",
  "delivered"
];

function Tracking({ status }) {
  if (status === "cancelled") {
    return (
      <div className="order-tracking cancelled-tracking">
        <div className="tracking-cancelled">
          <XCircle size={18} />
          <span>Order cancelled</span>
        </div>
      </div>
    );
  }

  const current =
    trackingSteps.indexOf(status);

  return (
    <div className="order-tracking">

      {trackingSteps.map((step, index) => {

        const completed =
          index <= current;

        return (
          <div
            className={
              completed
                ? "tracking-step completed"
                : "tracking-step"
            }
            key={step}
          >

            <div className="tracking-icon">
              {completed ? (
                <CheckCircle size={17} />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            <small>
              {step === "pending"
                ? "Order Placed"
                : step === "processing"
                ? "Processing"
                : step === "shipped"
                ? "Shipped"
                : "Delivered"}
            </small>

          </div>
        );
      })}

    </div>
  );
}

export default function Account({
  user,
  setUser
}) {

  const [mode, setMode] =
    useState("login");

  const [f, setF] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [err, setErr] =
    useState("");

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [canceling, setCanceling] =
    useState(null);

  useEffect(() => {

    if (user) {

      loadOrders();

    }

  }, [user]);

  async function loadOrders() {

    try {

      const data =
        await api("/orders/mine");

      setOrders(data);

    } catch {

      setOrders([]);

    }

  }

  function logout() {

    localStorage.removeItem(
      "thrift_token"
    );

    localStorage.removeItem(
      "thrift_user"
    );

    setUser(null);

  }

  async function cancelOrder(id) {

    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this order?"
      );

    if (!confirmed) return;

    setCanceling(id);
    setErr("");

    try {

      await api(
        `/orders/${id}/cancel`,
        {
          method: "PATCH"
        }
      );

      await loadOrders();

    } catch (e) {

      setErr(e.message);

    } finally {

      setCanceling(null);

    }

  }

  if (user) {

    return (

      <main className="account-premium">

        <section className="account-hero">

          <div>

            <p className="eyebrow">
              THE FASHION LAB
            </p>

            <h1>
              Welcome,
              <br />
              <em>{user.name}.</em>
            </h1>

            <p className="account-email">
              {user.email}
            </p>

          </div>

          <div className="account-profile-icon">
            <UserRound size={34} />
          </div>

        </section>


        <section className="account-toolbar">

          <div className="account-welcome">

            <Package size={18} />

            <span>

              <strong>
                Your wardrobe story
              </strong>

              <small>
                Track and manage your orders.
              </small>

            </span>

          </div>


          <div className="account-actions">

            {user.role === "admin" && (

              <Link
                className="account-admin-button"
                to="/admin"
              >
                ADMIN DASHBOARD
                <ArrowRight size={15} />
              </Link>

            )}

            <button
              className="account-logout"
              onClick={logout}
            >
              <LogOut size={15} />
              LOG OUT
            </button>

          </div>

        </section>


        {err && (
          <p className="error">
            {err}
          </p>
        )}


        <section className="account-orders">

          <div className="orders-heading">

            <div>

              <p className="eyebrow">
                YOUR HISTORY
              </p>

              <h2>
                Your orders
              </h2>

            </div>

            <span>
              {orders.length}{" "}
              {orders.length === 1
                ? "ORDER"
                : "ORDERS"}
            </span>

          </div>


          {!orders.length ? (

            <div className="orders-empty">

              <div className="orders-empty-icon">
                <ShoppingBag size={28} />
              </div>

              <p className="eyebrow">
                NOTHING HERE YET
              </p>

              <h3>
                Your next favourite
                <br />
                piece is waiting.
              </h3>

              <p>
                Explore our collection of carefully
                selected pre-loved pieces.
              </p>

              <Link
                to="/shop"
                className="account-shop-button"
              >
                EXPLORE THE COLLECTION
                <ArrowRight size={16} />
              </Link>

            </div>

          ) : (

            <div className="orders-list">

              {orders.map((o) => (

                <article
                  className="premium-order-card"
                  key={o.id}
                >

                  <div className="order-main">

                    <div className="order-icon">
                      <Package size={20} />
                    </div>

                    <div className="order-info">

                      <span className="order-label">
                        ORDER
                      </span>

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


                  <div className="order-status">

                    <span
                      className={`status status-${o.status}`}
                    >
                      {o.status}
                    </span>

                  </div>


                  <div className="order-total">

                    <span>
                      TOTAL
                    </span>

                    <strong>
                      {money(o.total)}
                    </strong>

                  </div>


                  {/* TRACKING */}

                  <Tracking
                    status={o.status}
                  />


                  {/* CANCEL */}

                  {o.status === "pending" && (

                    <div className="order-cancel-area">

                      <button
                        className="cancel-order-button"
                        disabled={
                          canceling === o.id
                        }
                        onClick={() =>
                          cancelOrder(o.id)
                        }
                      >

                        <XCircle size={15} />

                        {canceling === o.id
                          ? "CANCELLING..."
                          : "CANCEL ORDER"}

                      </button>

                      <small>
                        Cancellation is available
                        while your order is pending.
                      </small>

                    </div>

                  )}

                </article>

              ))}

            </div>

          )}

        </section>


        <section className="account-footer-message">

          <span>
            THE FASHION LAB
          </span>

          <p>
            Every purchase gives a beautiful
            piece another story.
          </p>

          <Link to="/shop">
            CONTINUE SHOPPING
            <ArrowRight size={15} />
          </Link>

        </section>

      </main>

    );

  }


  /* LOGIN / REGISTER */

  async function submit(e) {

    e.preventDefault();

    setErr("");
    setLoading(true);

    try {

      const d =
        await api(
          "/auth/" + mode,
          {
            method: "POST",
            body: JSON.stringify(f)
          }
        );

      localStorage.setItem(
        "thrift_token",
        d.token
      );

      localStorage.setItem(
        "thrift_user",
        JSON.stringify(d.user)
      );

      setUser(d.user);

    } catch (e) {

      setErr(e.message);

    } finally {

      setLoading(false);

    }

  }


  return (

    <main className="account-auth">

      <div className="auth-decoration">

        <span>THE</span>
        <em>FASHION</em>
        <span>LAB</span>

      </div>


      <section className="auth-card">

        <p className="eyebrow">
          YOUR ACCOUNT
        </p>

        <h1>
          {mode === "login"
            ? "Welcome back."
            : "Join the Fashion Lab."}
        </h1>

        <p className="auth-intro">
          {mode === "login"
            ? "Sign in to view your orders and continue your wardrobe story."
            : "Create an account to save your orders and discover your next favourite piece."}
        </p>


        <form
          className="premium-account-form"
          onSubmit={submit}
        >

          {mode === "register" && (

            <label>

              FULL NAME

              <input
                required
                placeholder="Your full name"
                value={f.name}
                onChange={(e) =>
                  setF({
                    ...f,
                    name: e.target.value
                  })
                }
              />

            </label>

          )}


          <label>

            EMAIL

            <input
              required
              type="email"
              placeholder="you@example.com"
              value={f.email}
              onChange={(e) =>
                setF({
                  ...f,
                  email: e.target.value
                })
              }
            />

          </label>


          <label>

            PASSWORD

            <input
              required
              minLength="6"
              type="password"
              placeholder="Your password"
              value={f.password}
              onChange={(e) =>
                setF({
                  ...f,
                  password: e.target.value
                })
              }
            />

          </label>


          {err && (
            <p className="error">
              {err}
            </p>
          )}


          <button
            disabled={loading}
            className="auth-submit"
          >

            {loading
              ? "PLEASE WAIT..."
              : mode === "login"
              ? "LOGIN"
              : "CREATE ACCOUNT"}

            {!loading && (
              <ArrowRight size={16} />
            )}

          </button>

        </form>


        <button
          className="auth-switch"
          onClick={() => {

            setErr("");

            setMode(
              mode === "login"
                ? "register"
                : "login"
            );

          }}
        >

          {mode === "login"
            ? "Don't have an account? Create one"
            : "Already registered? Login"}

        </button>

      </section>

    </main>

  );

}
