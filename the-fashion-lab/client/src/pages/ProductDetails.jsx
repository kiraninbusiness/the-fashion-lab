import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw
} from "lucide-react";

const money = (n) =>
  `₹${Number(n).toLocaleString("en-IN")}`;

export default function ProductDetails({
  products,
  add,
  wishlist,
  toggle
}) {
  const { id } = useParams();

  const product = products.find(
    (p) => String(p.id) === String(id)
  );

  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <main className="product-not-found">
        <p className="eyebrow">
          THE FASHION LAB
        </p>

        <h1>Piece not found.</h1>

        <Link to="/shop">
          <ArrowLeft size={16} />
          BACK TO SHOP
        </Link>
      </main>
    );
  }

  const isWishlisted =
    wishlist.includes(product.id);

  const addToBag = () => {
    for (let i = 0; i < qty; i++) {
      add(product);
    }
  };

  return (
    <main className="premium-product-page">

      {/* BREADCRUMB */}

      <div className="premium-breadcrumb">
        <Link to="/shop">
          <ArrowLeft size={14} />
          BACK TO COLLECTION
        </Link>

        <span>
          {product.category}
        </span>
      </div>


      {/* PRODUCT */}

      <section className="premium-product-detail">

        {/* IMAGE */}

        <div className="premium-product-gallery">

          <div className="premium-main-image">

            <img
              src={product.image}
              alt={product.name}
            />

            <div className="premium-image-number">
              {String(product.id).padStart(2, "0")}
            </div>

            <button
              type="button"
              className="premium-product-wishlist"
              onClick={() =>
                toggle(product.id)
              }
              aria-label="Add to wishlist"
            >
              <Heart
                size={20}
                strokeWidth={1.5}
                fill={
                  isWishlisted
                    ? "currentColor"
                    : "none"
                }
              />
            </button>

            <span className="premium-condition-badge">
              {product.stock < 1
                ? "SOLD OUT"
                : product.condition}
            </span>

          </div>

        </div>


        {/* INFORMATION */}

        <div className="premium-product-information">

          <p className="premium-product-category">
            {product.category}

            {product.gender
              ? ` · ${product.gender}`
              : ""}
          </p>

          <h1>
            {product.name}
          </h1>

          <div className="premium-price">

            <strong>
              {money(product.price)}
            </strong>

            {product.old_price && (
              <del>
                {money(product.old_price)}
              </del>
            )}

            {product.old_price && (
              <span>
                SAVE{" "}
                {Math.round(
                  ((product.old_price -
                    product.price) /
                    product.old_price) *
                    100
                )}
                %
              </span>
            )}

          </div>

          <div className="premium-divider" />


          {/* META */}

          <div className="premium-product-meta">

            <div>
              <span>SIZE</span>

              <strong>
                {product.size ||
                  "ONE SIZE"}
              </strong>
            </div>

            <div>
              <span>CONDITION</span>

              <strong>
                {product.condition ||
                  "PRE-LOVED"}
              </strong>
            </div>

            <div>
              <span>AVAILABILITY</span>

              <strong
                className={
                  product.stock > 0
                    ? "in-stock"
                    : "sold-stock"
                }
              >
                {product.stock > 0
                  ? "IN STOCK"
                  : "SOLD OUT"}
              </strong>
            </div>

          </div>


          {/* DESCRIPTION */}

          <div className="premium-description">

            <p className="description-label">
              ABOUT THIS PIECE
            </p>

            <p>
              {product.description ||
                "A carefully selected pre-loved piece with character, style and a story of its own."}
            </p>

          </div>


          {/* PURCHASE */}

          {product.stock > 0 ? (

            <div className="premium-purchase">

              <div className="premium-quantity">

                <button
                  type="button"
                  onClick={() =>
                    setQty((q) =>
                      Math.max(1, q - 1)
                    )
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>
                  {qty}
                </span>

                <button
  type="button"
  onClick={() =>
    setQty((q) => q + 1)
  }
  aria-label="Increase quantity"
>
  +
</button>

              </div>

              <button
                type="button"
                className="premium-add-button"
                onClick={addToBag}
              >
                ADD TO BAG

                <ArrowRight
                  size={17}
                />
              </button>

            </div>

          ) : (

            <div className="premium-sold-message">
              THIS PIECE HAS FOUND A NEW HOME.
            </div>

          )}


          {/* BENEFITS */}

          <div className="premium-benefits">

            <div>
              <Truck size={19} />

              <span>
                <strong>
                  SHIPPED WITH CARE
                </strong>

                Pan-India delivery.
              </span>
            </div>

            <div>
              <ShieldCheck size={19} />

              <span>
                <strong>
                  QUALITY CHECKED
                </strong>

                Every piece inspected.
              </span>
            </div>

            <div>
              <RotateCcw size={19} />

              <span>
                <strong>
                  PRE-LOVED, RE-LOVED
                </strong>

                Giving fashion another life.
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* STORY */}

      <section className="premium-product-story">

        <div className="story-number">
          01
        </div>

        <div>

          <p className="eyebrow">
            THE FASHION LAB
          </p>

          <h2>
            Every piece has
            <br />
            <em>another story.</em>
          </h2>

        </div>

        <div className="story-text">

          <p>
            We believe great clothing deserves
            more than one life.
          </p>

          <p>
            Each piece in our collection is
            selected with care and ready for
            its next chapter.
          </p>

          <Link to="/shop">
            EXPLORE MORE PIECES
            <ArrowRight size={16} />
          </Link>

        </div>

      </section>

    </main>
  );
}
