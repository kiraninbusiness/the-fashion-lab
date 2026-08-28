import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Check
} from "lucide-react";

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function ProductDetails({
  products = [],
  add,
  wishlist = [],
  toggle
}) {
  const { id } = useParams();

  const product = products.find(
    (p) => String(p.id) === String(id)
  );

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <main className="product-not-found">
        <p className="eyebrow">THE FASHION LAB</p>

        <h1>Piece not found.</h1>

        <p>
          This piece may have been removed or is
          no longer available.
        </p>

        <Link to="/shop">
          <ArrowLeft size={16} />
          BACK TO SHOP
        </Link>
      </main>
    );
  }

  const stock = Number(product.stock) || 0;
  const price = Number(product.price) || 0;
  const oldPrice = Number(product.old_price) || 0;

  const isWishlisted = wishlist.includes(product.id);

  const discount =
    oldPrice > price
      ? Math.round(
          ((oldPrice - price) / oldPrice) * 100
        )
      : 0;

  const increaseQty = () => {
    setQty((current) =>
      Math.min(stock, current + 1)
    );
  };

  const decreaseQty = () => {
    setQty((current) =>
      Math.max(1, current - 1)
    );
  };

  const addToBag = () => {
    if (stock < 1) return;

    for (let i = 0; i < qty; i++) {
      add(product);
    }

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  return (
    <main className="premium-product-page">

      {/* =========================================
          BREADCRUMB
      ========================================= */}

      <div className="premium-breadcrumb">

        <Link to="/shop">
          <ArrowLeft size={14} />
          BACK TO COLLECTION
        </Link>

        <span>
          {product.category || "COLLECTION"}
        </span>

      </div>


      {/* =========================================
          PRODUCT DETAIL
      ========================================= */}

      <section className="premium-product-detail">

        {/* =====================================
            PRODUCT IMAGE
        ===================================== */}

        <div className="premium-product-gallery">

          <div className="premium-main-image">

            <img
              src={product.image}
              alt={product.name}
            />

            <div className="premium-image-number">
              {String(product.id).padStart(2, "0")}
            </div>


            {/* DISCOUNT */}

            {discount > 0 && stock > 0 && (
              <span className="premium-detail-discount">
                -{discount}%
              </span>
            )}


            {/* WISHLIST */}

            <button
              type="button"
              className="premium-product-wishlist"
              onClick={() =>
                toggle(product.id)
              }
              aria-label={
                isWishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
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


            {/* CONDITION */}

            <span className="premium-condition-badge">

              {stock < 1
                ? "SOLD OUT"
                : product.condition || "PRE-LOVED"}

            </span>

          </div>

        </div>


        {/* =====================================
            PRODUCT INFORMATION
        ===================================== */}

        <div className="premium-product-information">

          <p className="premium-product-category">

            {product.category || "FASHION"}

            {product.gender
              ? ` · ${product.gender}`
              : ""}

          </p>


          <h1>
            {product.name}
          </h1>


          {/* PRICE */}

          <div className="premium-price">

            <strong>
              {money(price)}
            </strong>

            {oldPrice > price && (
              <del>
                {money(oldPrice)}
              </del>
            )}

            {discount > 0 && (
              <span>
                SAVE {discount}%
              </span>
            )}

          </div>


          <div className="premium-divider" />


          {/* =================================
              PRODUCT META
          ================================= */}

          <div className="premium-product-meta">

            <div>
              <span>SIZE</span>

              <strong>
                {product.size || "ONE SIZE"}
              </strong>
            </div>


            <div>
              <span>CONDITION</span>

              <strong>
                {product.condition || "PRE-LOVED"}
              </strong>
            </div>


            <div>
              <span>AVAILABILITY</span>

              <strong
                className={
                  stock > 0
                    ? "in-stock"
                    : "sold-stock"
                }
              >
                {stock > 0
                  ? `${stock} AVAILABLE`
                  : "SOLD OUT"}
              </strong>
            </div>

          </div>


          {/* =================================
              DESCRIPTION
          ================================= */}

          <div className="premium-description">

            <p className="description-label">
              ABOUT THIS PIECE
            </p>

            <p>
              {product.description ||
                "A carefully selected pre-loved piece with character, style and a story of its own."}
            </p>

          </div>


          {/* =================================
              PURCHASE
          ================================= */}

          {stock > 0 ? (

            <div className="premium-purchase">

              {/* QUANTITY */}

              <div className="premium-quantity">

                <button
                  type="button"
                  onClick={decreaseQty}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>

                <span>
                  {qty}
                </span>

                <button
                  type="button"
                  onClick={increaseQty}
                  disabled={qty >= stock}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>

              </div>


              {/* ADD TO BAG */}

              <button
                type="button"
                className={`premium-add-button ${
                  added
                    ? "added-to-bag"
                    : ""
                }`}
                onClick={addToBag}
              >

                {added ? (
                  <>
                    ADDED TO BAG
                    <Check size={17} />
                  </>
                ) : (
                  <>
                    ADD TO BAG
                    <ArrowRight size={17} />
                  </>
                )}

              </button>

            </div>

          ) : (

            <div className="premium-sold-message">
              THIS PIECE HAS FOUND A NEW HOME.
            </div>

          )}


          {/* =================================
              STOCK NOTICE
          ================================= */}

          {stock > 0 && stock <= 2 && (
            <p className="product-detail-stock-warning">
              Only {stock} left — don't miss it.
            </p>
          )}


          {/* =================================
              BENEFITS
          ================================= */}

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


      {/* =========================================
          PRODUCT STORY
      ========================================= */}

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
