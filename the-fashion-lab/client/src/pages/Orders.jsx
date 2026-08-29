import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock3,
  Truck,
  CheckCircle2,
  XCircle,
  MapPin,
  IndianRupee,
  ArrowRight,
  ShoppingBag,
  RefreshCw
} from "lucide-react";
import { api } from "../api";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;


/* --------------------------------
   STATUS BADGE
-------------------------------- */

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
    <span className={`order-status status-${status}`}>
      <Icon size={15} />
      {status}
    </span>
  );
}


/* --------------------------------
   ORDER PROGRESS
-------------------------------- */

function OrderProgress({ status }) {

  if (status === "cancelled") {
    return (
      <div className="customer-order-cancelled">
        <XCircle size={18} />
        <span>Order cancelled</span>
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
    <div className="customer-order-progress">

      {steps.map(([key, label], index) => (

        <React.Fragment key={key}>

          <div
            className={
              index <= current
                ? "customer-progress-step active"
                : "customer-progress-step"
            }
          >

            <div className="customer-progress-dot">

              {index < current ? (
                <CheckCircle2 size={14} />
              ) : (
                index + 1
              )}

            </div>

            <span>
              {label}
            </span>

          </div>


          {index < steps.length - 1 && (

            <div
              className={
                index < current
                  ? "customer-progress-line active"
                  : "customer-progress-line"
              }
            />

          )}

        </React.Fragment>

      ))}

    </div>
  );
}


/* --------------------------------
   MAIN COMPONENT
-------------------------------- */

export default function Orders({ user }) {

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [cancelling, setCancelling] = useState(null);


  /* --------------------------------
     LOAD ORDERS
  -------------------------------- */

  async function loadOrders(showRefresh = false) {

    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await api("/orders/mine");

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (e) {

      console.error(
        "LOAD ORDERS ERROR:",
        e
      );

      setError(
        e.message ||
        "Could not load your orders."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  }


  /* --------------------------------
     LOAD WHEN USER EXISTS
  -------------------------------- */

  useEffect(() => {

    if (user) {
      loadOrders();
    } else {
      setLoading(false);
    }

  }, [user]);


  /* --------------------------------
     CANCEL ORDER
  -------------------------------- */

  async function cancelOrder(orderId) {

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setCancelling(orderId);
      setError("");

      await api(
        `/orders/${orderId}/cancel`,
        {
          method: "PATCH"
        }
      );

      await loadOrders(true);

    } catch (e) {

      console.error(
        "CANCEL ORDER ERROR:",
        e
      );

      setError(
        e.message ||
        "Could not cancel this order."
      );

    } finally {

      setCancelling(null);

    }
  }


  /* --------------------------------
     NOT LOGGED IN
  -------------------------------- */

  if (!user) {

    return (
      <main className="page orders-page">

        <section className="orders-login-required">

          <div className="orders-empty-icon">
            <Package size={30} />
          </div>

          <p className="eyebrow">
            YOUR ORDERS
          </p>

          <h1>
            Sign in to see
            <br />
            <em>your orders.</em>
          </h1>

          <p>
            Sign in to view your order history
            and track your purchases.
          </p>

          <Link
            to="/account"
            className="button dark"
          >
            SIGN IN
            <ArrowRight size={16} />
          </Link>

        </section>

      </main>
    );
  }


  /* --------------------------------
     LOADING
  -------------------------------- */

  if (loading) {

    return (
      <main className="page orders-page">

        <section className="orders-loading">

          <Package size={30} />

          <p>
            Loading your orders...
          </p>

        </section>

      </main>
    );
  }


  /* --------------------------------
     PAGE
  -------------------------------- */

  return (
    <main className="page orders-page">

      {/* HEADER */}

      <section className="orders-header">

        <div>

          <p className="eyebrow">
            THE FASHION LAB
          </p>

          <h1>
            Your orders.
          </h1>

          <p className="orders-intro">
            Track your purchases and manage
            your recent orders.
          </p>

        </div>


        <div className="orders-header-actions">

          <span className="orders-count">
            {orders.length}{" "}
            {orders.length === 1
              ? "ORDER"
              : "ORDERS"}
          </span>

          <button
            type="button"
            className="orders-refresh"
            onClick={() =>
              loadOrders(true)
            }
            disabled={refreshing}
          >

            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "spinning"
                  : ""
              }
            />

            REFRESH

          </button>

        </div>

      </section>


      {/* ERROR */}

      {error && (

        <div className="orders-error">

          <XCircle size={18} />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* EMPTY */}

      {!orders.length ? (

        <section className="orders-empty">

          <div className="orders-empty-icon">

            <ShoppingBag
              size={30}
              strokeWidth={1.3}
            />

          </div>

          <p className="eyebrow">
            NO ORDERS YET
          </p>

          <h2>
            Your order history
            <br />
            <em>will live here.</em>
          </h2>

          <p>
            Once you place an order,
            you'll be able to track it here.
          </p>

          <Link
            to="/shop"
            className="button dark"
          >
            SHOP THE COLLECTION
            <ArrowRight size={16} />
          </Link>

        </section>

      ) : (

        /* --------------------------------
           ORDER LIST
        -------------------------------- */

        <section className="customer-order-list">

          {orders.map((order) => {

            const isCancelling =
              cancelling === order.id;

            const canCancel =
              order.status === "pending" &&
              order.payment_method === "cod";

            return (

              <article
                className="customer-order-card"
                key={order.id}
              >

                {/* TOP */}

                <div className="customer-order-top">

                  <div className="customer-order-number">

                    <div className="customer-order-icon">
                      <Package size={19} />
                    </div>

                    <div>

                      <span>
                        ORDER
                      </span>

                      <strong>
                        #{order.id}
                      </strong>

                      <small>
                        {new Date(
                          order.created_at
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
                    status={order.status}
                  />

                </div>


                {/* INFORMATION */}

                <div className="customer-order-info">

                  <div>

                    <IndianRupee size={17} />

                    <span>

                      <small>
                        ORDER TOTAL
                      </small>

                      <strong>
                        {money(order.total)}
                      </strong>

                    </span>

                  </div>


                  <div>

                    <Package size={17} />

                    <span>

                      <small>
                        PAYMENT
                      </small>

                      <strong>
                        {order.payment_method ===
                        "online"
                          ? "Online Payment"
                          : "Cash on Delivery"}
                      </strong>

                      <em>
                        {order.payment_status}
                      </em>

                    </span>

                  </div>


                  <div>

                    <MapPin size={17} />

                    <span>

                      <small>
                        DELIVERY ADDRESS
                      </small>

                      <strong>
                        {order.shipping_address ||
                          "Address not available"}
                      </strong>

                    </span>

                  </div>

                </div>


                {/* PROGRESS */}

                <OrderProgress
                  status={order.status}
                />


                {/* FOOTER */}

                <div className="customer-order-footer">

                  <div className="customer-order-contact">

                    <Truck size={16} />

                    <span>
                      Delivery to{" "}
                      <strong>
                        {order.shipping_name ||
                          user.name}
                      </strong>
                    </span>

                  </div>


                  {canCancel && (

                    <button
                      type="button"
                      className="customer-cancel-button"
                      disabled={isCancelling}
                      onClick={() =>
                        cancelOrder(order.id)
                      }
                    >

                      <XCircle size={15} />

                      {isCancelling
                        ? "CANCELLING..."
                        : "CANCEL ORDER"}

                    </button>

                  )}

                </div>

              </article>

            );
          })}

        </section>

      )}

    </main>
  );
}
