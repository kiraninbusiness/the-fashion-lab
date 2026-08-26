import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, ShoppingBag, X } from "lucide-react";

const money = (n) =>
  `₹${Number(n).toLocaleString("en-IN")}`;

export default function Wishlist({
  products,
  wishlist,
  toggle,
  add
}) {
  const savedProducts = products.filter((p) =>
    wishlist.includes(p.id)
  );

  return (
    <main className="page wishlist-page">

      <div className="wishlist-header">
        <div>
          <p className="eyebrow">THE FASHION LAB</p>

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
            <Heart size={30} strokeWidth={1.3} />
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

          {savedProducts.map((p) => (

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
                  className="wishlist-add"
                  disabled={p.stock < 1}
                  onClick={() =>
                    p.stock > 0 && add(p)
                  }
                >
                  {p.stock < 1
                    ? "SOLD OUT"
                    : "ADD TO BAG"}

                  {p.stock > 0 && (
                    <ShoppingBag size={15} />
                  )}
                </button>

                <button
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

          ))}

        </div>

      )}

    </main>
  );
}
