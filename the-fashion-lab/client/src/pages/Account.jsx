import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Clock,
  LogOut,
  Package,
  ShoppingBag,
  Truck,
  UserRound,
  X
} from "lucide-react";
import { api } from "../api";

const money = (n) =>
  `₹${Number(n).toLocaleString("en-IN")}`;

/*
  ORDER STATUS HELPERS
*/

const statusSteps = [
  {
    key: "pending",
    label: "Order Placed",
    description: "Your order has been received."
  },
  {
    key: "processing",
    label: "Processing",
    description: "We're preparing your order."
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "Your order is on its way."
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Your order has been delivered."
  }
];

function getStatusIndex(status) {
  const index = statusSteps.findIndex(
    (step) => step.key === status
  );

  return index === -1 ? 0 : index;
}


/*
  ORDER TRACKING
*/

function OrderTracking({ status }) {
  if (status === "cancelled") {
    return (
      <div className="order-tracking cancelled-tracking">

        <div className="tracking-cancelled-icon">
          <X size={20} />
        </div>

        <div className="tracking-cancelled-text">
          <strong>Order Cancelled</strong>
          <small>
            This order has been cancelled successfully.
          </small>
        </div>

      </div>
    );
  }

  const currentIndex = getStatusIndex(status);

  return (
    <div className="order-tracking">

      <div className="tracking-line" />

      {statusSteps.map((step, index) => {

        const completed =
          index <= currentIndex;

        const current =
          index === currentIndex;

        return (
          <div
            className={
              completed
                ? "tracking-step completed"
                : "tracking-step"
            }
            key={step.key}
          >

            <div
              className={
                current
                  ? "tracking-dot current"
                  : completed
                  ? "tracking-dot"
                  : "tracking-dot upcoming"
              }
            >
              {completed ? (
                <Check size={13} />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            <div className="tracking-content">

              <strong>
                {step.label}
              </strong>

              <small>
                {current
                  ? step.description
                  : index < currentIndex
                  ? "Completed"
                  : "Upcoming"}
              </small>

            </div>

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

  const [cancelling, setCancelling] =
    useState(null);

  /*
    LOAD ORDERS
  */

  useEffect(() => {

    if (!user) return;

    loadOrders();

  }, [user]);


  async function loadOrders() {

    try {

      const data =
        await api("/orders/mine");

      setOrders(data);

    } catch (e) {

      console.error(e);

      setOrders([]);

    }

  }


  /*
    LOGOUT
  */

  function logout() {

    localStorage.removeItem(
      "thrift_token"
    );

    localStorage.removeItem(
      "thrift_user"
    );

    setUser(null);

  }


  /*
    CANCEL ORDER
  */

  async function cancelOrder(orderId) {

    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this order?"
      );

    if (!confirmed) return;

    setCancelling(orderId);
    setErr("");

    try {

      await api(
        `/orders/${orderId}/cancel`,
        {
          method: "PATCH"
        }
      );

      /*
        Reload orders so the customer
        immediately sees CANCELLED.
      */

      await loadOrders();

    } catch (e) {

      setErr(
        e.message ||
        "Could not cancel order."
      );

    } finally {

      setCancelling(null);

    }

  }


  /*
    LOGGED-IN ACCOUNT
  */

  if (user) {

    return (

      <main className="account-premium">

        {/* ACCOUNT HERO */}

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


        {/* ACCOUNT TOOLBAR */}

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


        {/* ORDERS */}

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


          {err && (

            <p className="error account-error">
              {err}
            </p>

          )}


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

                  {/* ORDER HEADER */}

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


                  {/* STATUS */}

                  <div className="order-status">

                    <span
                      className={`status status-${o.status}`}
                    >
                      {o.status}
                    </span>

                  </div>


                  {/* TOTAL */}

                  <div className="order-total">

                    <span>
                      TOTAL
                    </span>

                    <strong>
                      {money(o.total)}
                    </strong>

                  </div>


                  {/* TRACKING */}

                  <div className="order-tracking-wrapper">

                    <div className="tracking-title">

                      <div>

                        <p className="eyebrow">
                          ORDER TRACKING
                        </p>

                        <strong>
                          {o.status === "cancelled"
                            ? "Order cancelled"
                            : o.status === "delivered"
                            ? "Your order has arrived"
                            : o.status === "shipped"
                            ? "Your order is on the way"
                            : o.status === "processing"
                            ? "We're preparing your order"
                            : "Your order has been placed"}
                        </strong>

                      </div>

                      {o.status === "shipped" && (
                        <Truck size={20} />
                      )}

                      {o.status === "delivered" && (
                        <Check size={20} />
                      )}

                      {o.status === "processing" && (
                        <Package size={20} />
                      )}

                      {o.status === "pending" && (
                        <Clock size={20} />
                      )}

                    </div>


                    <OrderTracking
                      status={o.status}
                    />

                  </div>


                  {/* CANCEL BUTTON */}

                  {o.status === "pending" && (

                    <div className="order-cancel-area">

                      <p>
                        You can cancel this order
                        while it is still pending.
                      </p>

                      <button
                        type="button"
                        className="cancel-order-button"
                        disabled={
                          cancelling === o.id
                        }
                        onClick={() =>
                          cancelOrder(o.id)
                        }
                      >

                        {cancelling === o.id
                          ? "CANCELLING..."
                          : "CANCEL ORDER"}

                        {cancelling !== o.id && (
                          <X size={15} />
                        )}

                      </button>

                    </div>

                  )}

                </article>

              ))}

            </div>

          )}

        </section>


        {/* FOOTER MESSAGE */}

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


  /*
    LOGIN / REGISTER
  */

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

        <span>
          THE
        </span>

        <em>
          FASHION
        </em>

        <span>
          LAB
        </span>

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
