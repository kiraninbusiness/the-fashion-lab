import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  ShoppingBag,
  X,
  Check
} from "lucide-react";

const money = (n) =>
  `₹${Number(n).toLocaleString("en-IN")}`;

export default function Wishlist({
  products,
  wishlist,
  toggle,
  add
}) {
  const [added, setAdded] = useState({});

  const savedProducts = products.filter((p) =>
    wishlist.includes(p.id)
  );

  const handleAdd = (product) => {
    if (product.stock < 1) return;

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

      <div className="wishlist-header">
        <div>
          <p className="eyebrow">
            THE FASHION LAB
          </p>

          <h1>Your wishlist.</h1>

          <p className="wishlist-intro">
            Pieces you've saved for later.
          </p>
        </div>

        <span className="wishlist-count">
          {savedProducts.length}{" "}
          {savedProducts.length === 1
            ? "PIECE"
            : "PIECES"}
        </span>
      </div>

      {!savedProducts.length ? (

        <section className="wishlist-empty">

          <div className="wishlist-empty-icon">
            <Heart
              size={30}
              strokeWidth={1.3}
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

        <div className="wishlist-grid">

          {savedProducts.map((p) => {

            const isAdded = added[p.id];

            return (
              <article
                className="wishlist-card"
                key={p.id}
              >

                <Link
                  to={`/product/${p.id}`}
                  className="wishlist-image"
                >

                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                  />

                  <span>
                    {p.stock < 1
                      ? "SOLD OUT"
                      : p.condition}
                  </span>

                </Link>

                <div className="wishlist-info">

                  <div>
                    <small>
                      {p.category} · {p.size}
                    </small>

                    <h3>
                      {p.name}
                    </h3>
                  </div>

                  <strong>
                    {money(p.price)}

                    {p.old_price && (
                      <del>
                        {money(p.old_price)}
                      </del>
                    )}
                  </strong>

                </div>

                <div className="wishlist-actions">

                  <button
                    type="button"
                    className="wishlist-add"
                    disabled={
                      p.stock < 1 || isAdded
                    }
                    onClick={() =>
                      handleAdd(p)
                    }
                  >

                    {p.stock < 1 ? (
                      "SOLD OUT"
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

                  <button
                    type="button"
                    className="wishlist-remove"
                    onClick={() =>
                      toggle(p.id)
                    }
                    aria-label="Remove from wishlist"
                  >
                    <X size={16} />
                  </button>

                </div>

              </article>
            );
          })}

        </div>

      )}

    </main>
  );
}
