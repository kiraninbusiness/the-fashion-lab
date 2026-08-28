import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  ShoppingBag,
  X,
  Check,
  ArrowUpRight
} from "lucide-react";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function Wishlist({
  products = [],
  wishlist = [],
  toggle,
  add
}) {
  const [added, setAdded] = useState({});

  const savedProducts = products.filter((p) =>
    wishlist.includes(p.id)
  );

  const handleAdd = (product) => {
    const stock = Number(product.stock) || 0;

    if (stock < 1) return;

    add(product);

    setAdded((prev) => ({
      ...prev,
      [product.id]: true
    }));

    setTimeout(() => {
      setAdded((prev) => ({
        ...prev,
        [product.id]: false
      }));
    }, 1800);
  };

  return (
    <main className="page wishlist-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="wishlist-header">

        <div>

          <p className="eyebrow">
            THE FASHION LAB
          </p>

          <h1>
            Your wishlist.
          </h1>

          <p className="wishlist-intro">
            Pieces you've saved for later.
          </p>

        </div>

        <div className="wishlist-count">

          <Heart size={15} />

          <span>
            {savedProducts.length}{" "}
            {savedProducts.length === 1
              ? "PIECE"
              : "PIECES"}
          </span>

        </div>

      </div>


      {/* =====================================
          EMPTY WISHLIST
      ===================================== */}

      {!savedProducts.length ? (

        <section className="wishlist-empty">

          <div className="wishlist-empty-icon">

            <Heart
              size={30}
              strokeWidth={1.2}
            />

          </div>

          <p className="eyebrow">
            NOTHING SAVED YET
          </p>

          <h2>
            Your favourites
            <br />
            <em>will live here.</em>
          </h2>

          <p>
            Save pieces you love and come back
            to them whenever you're ready.
          </p>

          <Link
            to="/shop"
            className="button dark"
          >
            EXPLORE THE COLLECTION
            <ArrowRight size={16} />
          </Link>

        </section>

      ) : (

        <>
          {/* =================================
              WISHLIST INTRO BAR
          ================================= */}

          <div className="wishlist-toolbar">

            <span>
              {savedProducts.length}{" "}
              SAVED{" "}
              {savedProducts.length === 1
                ? "PIECE"
                : "PIECES"}
            </span>

            <Link to="/shop">
              CONTINUE SHOPPING
              <ArrowRight size={15} />
            </Link>

          </div>


          {/* =================================
              PRODUCTS
          ================================= */}

          <div className="wishlist-grid">

            {savedProducts.map((p) => {

              const stock =
                Number(p.stock) || 0;

              const price =
                Number(p.price) || 0;

              const oldPrice =
                Number(p.old_price) || 0;

              const discount =
                oldPrice > price
                  ? Math.round(
                      ((oldPrice - price) /
                        oldPrice) *
                        100
                    )
                  : 0;

              const isAdded =
                added[p.id];

              return (

                <article
                  className={`wishlist-card ${
                    stock < 1
                      ? "wishlist-sold-out"
                      : ""
                  }`}
                  key={p.id}
                >

                  {/* =========================
                      IMAGE
                  ========================= */}

                  <Link
                    to={`/product/${p.id}`}
                    className="wishlist-image"
                  >

                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                    />


                    {/* NUMBER */}

                    <span className="wishlist-number">
                      {String(p.id).padStart(2, "0")}
                    </span>


                    {/* DISCOUNT */}

                    {discount > 0 &&
                      stock > 0 && (
                        <span className="wishlist-discount">
                          -{discount}%
                        </span>
                      )}


                    {/* CONDITION */}

                    <span className="wishlist-condition">
                      {stock < 1
                        ? "SOLD OUT"
                        : p.condition ||
                          "PRE-LOVED"}
                    </span>

                  </Link>


                  {/* =========================
                      INFORMATION
                  ========================= */}

                  <div className="wishlist-info">

                    <div>

                      <small>

                        {p.category ||
                          "FASHION"}

                        {p.gender
                          ? ` · ${p.gender}`
                          : ""}

                        {p.size
                          ? ` · ${p.size}`
                          : ""}

                      </small>

                      <h3>

                        <Link
                          to={`/product/${p.id}`}
                        >
                          {p.name}
                        </Link>

                      </h3>

                    </div>


                    {/* PRICE */}

                    <strong>

                      {money(price)}

                      {oldPrice > price && (
                        <del>
                          {money(oldPrice)}
                        </del>
                      )}

                    </strong>

                  </div>


                  {/* =========================
                      LOW STOCK
                  ========================= */}

                  {stock > 0 &&
                    stock <= 2 && (

                      <p className="wishlist-stock-warning">
                        Only {stock} left
                      </p>

                  )}


                  {/* =========================
                      ACTIONS
                  ========================= */}

                  <div className="wishlist-actions">

                    <button
                      type="button"
                      className={`wishlist-add ${
                        isAdded
                          ? "added-to-bag"
                          : ""
                      }`}
                      disabled={
                        stock < 1 ||
                        isAdded
                      }
                      onClick={() =>
                        handleAdd(p)
                      }
                    >

                      {stock < 1 ? (

                        <>
                          SOLD OUT
                        </>

                      ) : isAdded ? (

                        <>
                          ADDED TO BAG
                          <Check size={15} />
                        </>

                      ) : (

                        <>
                          ADD TO BAG
                          <ShoppingBag size={15} />
                        </>

                      )}

                    </button>


                    {/* VIEW PRODUCT */}

                    <Link
                      to={`/product/${p.id}`}
                      className="wishlist-view"
                      aria-label="View product"
                    >
                      <ArrowUpRight size={17} />
                    </Link>


                    {/* REMOVE */}

                    <button
                      type="button"
                      className="wishlist-remove"
                      onClick={() =>
                        toggle(p.id)
                      }
                      aria-label={`Remove ${p.name} from wishlist`}
                    >
                      <X size={16} />
                    </button>

                  </div>

                </article>

              );
            })}

          </div>


          {/* =================================
              BOTTOM CTA
          ================================= */}

          <section className="wishlist-bottom">

            <div>

              <p className="eyebrow">
                KEEP EXPLORING
              </p>

              <h2>
                There’s more
                <br />
                <em>to discover.</em>
              </h2>

            </div>

            <Link
              to="/shop"
              className="button dark"
            >
              SHOP ALL PIECES
              <ArrowRight size={16} />
            </Link>

          </section>

        </>

      )}

    </main>
  );
}
