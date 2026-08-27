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
    (s, i) => s + Number(i.price) * Number(i.qty),
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

  /*
    Load Razorpay checkout script
  */
  const loadRazorpay = () => {
    return new Promise((resolve) => {

      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () =>
        resolve(true);

      script.onerror = () =>
        resolve(false);

      document.body.appendChild(script);
    });
  };


  /*
    COD ORDER
  */
  async function createCODOrder() {

    const d = await api(
      "/orders/create",
      {
        method: "POST",
        body: JSON.stringify({
          items: cart.map((i) => ({
            productId: i.id,
            quantity: Number(i.qty)
          })),

          shipping: {
            ...f,
            address:
              `${f.address}, ${f.city} - ${f.pincode}`
          },

          payment_method: "cod"
        })
      }
    );

    clearCart();

    nav("/success", {
      state: {
        order: d.order,
        paymentMethod: "cod"
      }
    });
  }


  /*
    ONLINE PAYMENT
  */
  async function createOnlineOrder() {

    const loaded = await loadRazorpay();

    if (!loaded) {
      throw new Error(
        "Unable to load Razorpay. Please check your internet connection."
      );
    }

    /*
      First create order on our backend
    */
    const d = await api(
      "/orders/create",
      {
        method: "POST",
        body: JSON.stringify({
          items: cart.map((i) => ({
            productId: i.id,
            quantity: Number(i.qty)
          })),

          shipping: {
            ...f,
            address:
              `${f.address}, ${f.city} - ${f.pincode}`
          },

          payment_method: "online"
        })
      }
    );

    const order = d.order;

    /*
      Razorpay public key
    */
    const key =
      import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!key) {
      throw new Error(
        "Razorpay key is not configured on the frontend."
      );
    }

    /*
      Open Razorpay
    */
    const options = {

      key,

      amount:
        Number(total) * 100,

      currency: "INR",

      name: "The Fashion Lab",

      description:
        "Pre-loved fashion order",

      order_id:
        order.razorpay_order_id,

      prefill: {
        name: f.name,
        contact: f.phone,
        email: user?.email || ""
      },

      notes: {
        address:
          `${f.address}, ${f.city} - ${f.pincode}`
      },

      theme: {
        color: "#111111"
      },

      handler: async function (response) {

        try {

          /*
            Verify payment with backend
          */
          const verified =
            await api(
              "/orders/verify-payment",
              {
                method: "POST",

                body: JSON.stringify({
                  orderId: order.id,

                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature
                })
              }
            );

          clearCart();

          nav("/success", {
            state: {
              order:
                verified || order,
              paymentMethod: "online"
            }
          });

        } catch (error) {

          setErr(
            error.message ||
              "Payment verification failed."
          );

          setBusy(false);
        }
      },

      modal: {
        ondismiss: function () {
          setBusy(false);
          setErr(
            "Payment was cancelled. Your order was not completed."
          );
        }
      }
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.on(
      "payment.failed",
      function (response) {

        console.error(
          "RAZORPAY PAYMENT FAILED:",
          response
        );

        setBusy(false);

        setErr(
          response?.error?.description ||
            "Payment failed. Please try again."
        );
      }
    );

    razorpay.open();
  }


  /*
    PLACE ORDER
  */
  async function place(e) {

    e.preventDefault();

    if (!user) {
      nav("/account");
      return;
    }

    setBusy(true);
    setErr("");

    try {

      if (method === "cod") {

        await createCODOrder();

      } else {

        await createOnlineOrder();

      }

    } catch (x) {

      console.error(x);

      setErr(
        x.message ||
          "Could not place your order."
      );

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

          {/* DELIVERY */}

          <section className="checkout-section">

            <div className="checkout-section-heading">

              <span>01</span>

              <div>
                <h2>
                  Delivery details
                </h2>

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
                  maxLength="10"
                  placeholder="10-digit phone number"
                  value={f.phone}
                  onChange={(e) =>
                    setF({
                      ...f,
                      phone:
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
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
                    maxLength="6"
                    placeholder="6-digit pincode"
                    value={f.pincode}
                    onChange={(e) =>
                      setF({
                        ...f,
                        pincode:
                          e.target.value.replace(
                            /\D/g,
                            ""
                          )
                      })
                    }
                  />
                </label>

              </div>

            </div>

          </section>


          {/* PAYMENT */}

          <section className="checkout-section">

            <div className="checkout-section-heading">

              <span>02</span>

              <div>
                <h2>
                  Payment
                </h2>

                <p>
                  Choose how you'd like to pay.
                </p>
              </div>

            </div>


            <div className="payment-options">

              {/* COD */}

              <label
                className={
                  method === "cod"
                    ? "payment-card selected"
                    : "payment-card"
                }
              >

                <input
                  type="radio"
                  name="payment"
                  checked={
                    method === "cod"
                  }
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


              {/* ONLINE */}

              <label
                className={
                  method === "online"
                    ? "payment-card selected"
                    : "payment-card"
                }
              >

                <input
                  type="radio"
                  name="payment"
                  checked={
                    method === "online"
                  }
                  onChange={() =>
                    setMethod("online")
                  }
                />

                <div>
                  <strong>
                    Online Payment
                  </strong>

                  <small>
                    Pay securely with Razorpay.
                  </small>
                </div>

                <span className="payment-check">
                  ✓
                </span>

              </label>

            </div>


            {method === "online" && (
              <p className="notice">
                You will be redirected to the
                secure Razorpay payment window.
              </p>
            )}


            {err && (
              <p className="error">
                {err}
              </p>
            )}

          </section>


          {/* PLACE ORDER */}

          <button
            type="submit"
            className="premium-place-order"
            disabled={busy}
          >

            {busy
              ? method === "online"
                ? "OPENING PAYMENT..."
                : "CREATING ORDER..."
              : method === "online"
                ? "PAY NOW"
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


        {/* SUMMARY */}

        <aside className="premium-order-summary">

          <div className="summary-header">

            <div>

              <p className="eyebrow">
                YOUR SELECTION
              </p>

              <h2>
                Order summary
              </h2>

            </div>

            <span>

              {cart.reduce(
                (s, i) =>
                  s + Number(i.qty),
                0
              )}

              {" "}

              {cart.reduce(
                (s, i) =>
                  s + Number(i.qty),
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
                      Number(item.price) *
                        Number(item.qty)
                    )}
                  </b>

                </div>

              </div>

            ))}

          </div>


          <div className="summary-calculation">

            <div>
              <span>
                Subtotal
              </span>

              <b>
                {money(subtotal)}
              </b>
            </div>


            <div>

              <span>
                Shipping
              </span>

              <b>
                {shipping
                  ? money(shipping)
                  : "FREE"}
              </b>

            </div>

          </div>


          <div className="summary-total">

            <span>
              TOTAL
            </span>

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
