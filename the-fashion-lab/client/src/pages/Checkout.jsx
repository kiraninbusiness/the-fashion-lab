import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Truck,
  ShieldCheck
} from "lucide-react";
import { api } from "../api";

const money = (n) =>
  `₹${Number(n).toLocaleString("en-IN")}`;

export default function Checkout({
  cart,
  user,
  clearCart
}) {
  const nav = useNavigate();

  const [f, setF] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    city: "",
    pincode: ""
  });

  const [method, setMethod] = useState("cod");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const subtotal = cart.reduce(
    (s, i) => s + i.price * i.qty,
    0
  );

  const shipping = subtotal >= 1499 ? 0 : 79;
  const total = subtotal + shipping;

  if (!cart.length) {
    return (
      <main className="checkout-empty">

        <p className="eyebrow">
          THE FASHION LAB
        </p>

        <h1>Your bag is empty.</h1>

        <p>
          Discover something special for your
          next wardrobe story.
        </p>

        <Link
          className="button dark"
          to="/shop"
        >
          SHOP THE COLLECTION
          <ArrowRight size={16} />
        </Link>

      </main>
    );
  }

  async function place(e) {
    e.preventDefault();

    if (!user) {
      nav("/account");
      return;
    }

    setBusy(true);
    setErr("");

    try {
      const d = await api(
        "/orders/create",
        {
          method: "POST",
          body: JSON.stringify({
            items: cart.map((i) => ({
              productId: i.id,
              quantity: i.qty
            })),

            shipping: {
              ...f,
              address:
                `${f.address}, ${f.city} - ${f.pincode}`
            },

            payment_method: method
          })
        }
      );

      clearCart();

      nav("/success", {
        state: {
          order: d.order,
          paymentMethod: method
        }
      });

    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="checkout-page">

      <div className="checkout-top">

        <Link to="/shop">
          <ArrowLeft size={15} />
          CONTINUE SHOPPING
        </Link>

        <div className="secure-label">
          <Lock size={13} />
          SECURE CHECKOUT
        </div>

      </div>

      <section className="checkout-heading">

        <p className="eyebrow">
          THE FASHION LAB
        </p>

        <h1>
          Complete
          <br />
          <em>your order.</em>
        </h1>

      </section>

      <div className="checkout-grid premium-checkout-grid">

        <form
          className="checkout-form"
          onSubmit={place}
        >

          <section className="checkout-section">

            <div className="checkout-section-heading">
              <span>01</span>

              <div>
                <h2>Delivery details</h2>
                <p>
                  Where should we send your pieces?
                </p>
              </div>
            </div>

            <div className="checkout-fields">

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

              <label>
                PHONE NUMBER
                <input
                  required
                  pattern="[0-9]{10}"
                  placeholder="10-digit phone number"
                  value={f.phone}
                  onChange={(e) =>
                    setF({
                      ...f,
                      phone: e.target.value
                    })
                  }
                />
              </label>

              <label>
                ADDRESS
                <textarea
                  required
                  rows="4"
                  placeholder="House / street / area"
                  value={f.address}
                  onChange={(e) =>
                    setF({
                      ...f,
                      address: e.target.value
                    })
                  }
                />
              </label>

              <div className="two-inputs">

                <label>
                  CITY
                  <input
                    required
                    placeholder="City"
                    value={f.city}
                    onChange={(e) =>
                      setF({
                        ...f,
                        city: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  PINCODE
                  <input
                    required
                    pattern="[0-9]{6}"
                    placeholder="6-digit pincode"
                    value={f.pincode}
                    onChange={(e) =>
                      setF({
                        ...f,
                        pincode: e.target.value
                      })
                    }
                  />
                </label>

              </div>

            </div>

          </section>

          <section className="checkout-section">

            <div className="checkout-section-heading">
              <span>02</span>

              <div>
                <h2>Payment</h2>
                <p>
                  Choose how you'd like to pay.
                </p>
              </div>
            </div>

            <div className="payment-options">

              <label
                className={
                  method === "cod"
                    ? "payment-card selected"
                    : "payment-card"
                }
              >

                <input
                  type="radio"
                  checked={method === "cod"}
                  onChange={() =>
                    setMethod("cod")
                  }
                />

                <div>
                  <strong>
                    Cash on Delivery
                  </strong>

                  <small>
                    Pay when your order arrives.
                  </small>
                </div>

                <span className="payment-check">
                  ✓
                </span>

              </label>

              <label
                className={
                  method === "online"
                    ? "payment-card selected"
                    : "payment-card"
                }
              >

                <input
                  type="radio"
                  checked={method === "online"}
                  onChange={() =>
                    setMethod("online")
                  }
                />

                <div>
                  <strong>
                    Online Payment
                  </strong>

                  <small>
                    Available when Razorpay
                    is configured.
                  </small>
                </div>

                <span className="payment-check">
                  ✓
                </span>

              </label>

            </div>

            {method === "online" && (
              <p className="notice">
                Online payment requires your
                Razorpay keys on Render. For now,
                choose Cash on Delivery.
              </p>
            )}

            {err && (
              <p className="error">
                {err}
              </p>
            )}

          </section>

          <button
            type="submit"
            className="premium-place-order"
            disabled={
              busy || method === "online"
            }
          >
            {busy
              ? "CREATING ORDER..."
              : "PLACE ORDER"}

            {!busy && (
              <ArrowRight size={17} />
            )}
          </button>

          <p className="checkout-security">
            <Lock size={13} />
            Your information is securely handled.
          </p>

        </form>

        <aside className="premium-order-summary">

          <div className="summary-header">
            <div>
              <p className="eyebrow">
                YOUR SELECTION
              </p>

              <h2>Order summary</h2>
            </div>

            <span>
              {cart.reduce(
                (s, i) => s + i.qty,
                0
              )}{" "}
              {cart.reduce(
                (s, i) => s + i.qty,
                0
              ) === 1
                ? "ITEM"
                : "ITEMS"}
            </span>
          </div>

          <div className="checkout-products">

            {cart.map((item) => (

              <div
                className="checkout-product"
                key={item.id}
              >

                <div className="checkout-product-image">
                  <img
                    src={item.image}
                    alt={item.name}
                  />

                  <span>
                    {item.qty}
                  </span>
                </div>

                <div className="checkout-product-info">

                  <strong>
                    {item.name}
                  </strong>

                  <small>
                    {item.category}
                    {item.size
                      ? ` · ${item.size}`
                      : ""}
                  </small>

                  <b>
                    {money(
                      item.price * item.qty
                    )}
                  </b>

                </div>

              </div>

            ))}

          </div>

          <div className="summary-calculation">

            <div>
              <span>Subtotal</span>
              <b>{money(subtotal)}</b>
            </div>

            <div>
              <span>Shipping</span>

              <b>
                {shipping
                  ? money(shipping)
                  : "FREE"}
              </b>
            </div>

          </div>

          <div className="summary-total">

            <span>TOTAL</span>

            <strong>
              {money(total)}
            </strong>

          </div>

          <div className="checkout-benefits">

            <div>
              <Truck size={18} />

              <span>
                <strong>
                  FREE SHIPPING
                </strong>

                On orders above ₹1,499.
              </span>
            </div>

            <div>
              <ShieldCheck size={18} />

              <span>
                <strong>
                  QUALITY CHECKED
                </strong>

                Every piece inspected.
              </span>
            </div>

          </div>

        </aside>

      </div>

    </main>
  );
}
