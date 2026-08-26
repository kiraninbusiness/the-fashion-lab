import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle,
  Package,
  ArrowRight,
  ShoppingBag
} from "lucide-react";

export default function Success() {
  const { state } = useLocation();

  const orderId = state?.order?.id;

  return (
    <main className="success-page">

      <div className="success-circle">
        <CheckCircle size={42} strokeWidth={1.5} />
      </div>

      <p className="eyebrow">
        ORDER CONFIRMED
      </p>

      <h1>
        Thank you for
        <br />
        shopping <em>pre-loved.</em>
      </h1>

      <p className="success-intro">
        Your order{" "}
        {orderId ? (
          <strong>#{orderId}</strong>
        ) : (
          ""
        )}{" "}
        has been created successfully.
      </p>

      <div className="success-note">

        <Package size={22} />

        <div>
          <strong>
            Your pieces are on their way.
          </strong>

          <span>
            We'll carefully prepare your order
            and update its status from your account.
          </span>
        </div>

      </div>

      <div className="success-actions">

        <Link
          className="success-primary-button"
          to="/account"
        >
          VIEW MY ORDERS
          <ArrowRight size={16} />
        </Link>

        <Link
          className="success-secondary-button"
          to="/shop"
        >
          <ShoppingBag size={15} />
          CONTINUE SHOPPING
        </Link>

      </div>

      <div className="success-message">

        <span>01</span>

        <p>
          Thank you for giving a beautiful piece
          another story.
        </p>

      </div>

    </main>
  );
}
