import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  MapPin,
  CheckCircle,
  Clock
} from "lucide-react";

const money = (n) =>
  `₹${Number(n).toLocaleString("en-IN")}`;

export default function ProductDetails({
  products,
  add,
  wishlist,
  toggle,
  setCart
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find(
    (p) => String(p.id) === String(id)
  );

  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] =
    useState("");

  /*
    ------------------------------------------------
    RECENTLY VIEWED
    ------------------------------------------------
  */

  useEffect(() => {
    if (!product) return;

    const previous = JSON.parse(
      localStorage.getItem("thrift_recently_viewed") ||
        "[]"
    );

    const updated = [
      product.id,
      ...previous.filter(
        (item) => item !== product.id
      )
    ].slice(0, 6);

    localStorage.setItem(
      "thrift_recently_viewed",
      JSON.stringify(updated)
    );
  }, [product]);

  if (!product) {
    return (
      <main className="product-not-found">

        <p className="eyebrow">
          THE FASHION LAB
        </p>

        <h1>
          Piece not found.
        </h1>

        <Link to="/shop">
          <ArrowLeft size={16} />
          BACK TO SHOP
        </Link>

      </main>
    );
  }

  const stock = Number(product.stock) || 0;

  const isWishlisted =
    wishlist.includes(product.id);

  const discount =
    product.old_price &&
    Number(product.old_price) > Number(product.price)
      ? Math.round(
          ((Number(product.old_price) -
            Number(product.price)) /
            Number(product.old_price)) *
            100
        )
      : 0;

  /*
    ------------------------------------------------
    ADD TO BAG
    ------------------------------------------------
  */

  const addToBag = () => {
    if (stock < 1) return;

    const quantity = Math.min(qty, stock);

    for (let i = 0; i < quantity; i++) {
      add(product);
    }

    setQty(1);
  };

  /*
    ------------------------------------------------
    BUY NOW
    ------------------------------------------------
  */

  const buyNow = () => {
    if (stock < 1) return;

    const quantity = Math.min(qty, stock);

    if (setCart) {
      setCart((currentCart) => {

        const existing = currentCart.find(
          (item) => item.id === product.id
        );

        if (existing) {
          return currentCart.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  ...product,
                  qty: Math.min(
                    stock,
                    existing.qty + quantity
                  )
                }
              : item
          );
        }

        return [
          ...currentCart,
          {
            ...product,
            qty: quantity
          }
        ];
      });
    } else {
      for (let i = 0; i < quantity; i++) {
        add(product);
      }
    }

    navigate("/checkout");
  };

  /*
    ------------------------------------------------
    DELIVERY CHECK
    ------------------------------------------------
  */

  const checkDelivery = () => {

    const code = pincode.trim();

    if (!/^\d{6}$/.test(code)) {
      setDeliveryMessage(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    setDeliveryMessage(
      "Delivery available to this pincode. Estimated delivery: 3–7 business days."
    );
  };

  /*
    ------------------------------------------------
    RELATED PRODUCTS
    ------------------------------------------------
  */

  const relatedProducts = products
    .filter(
      (p) =>
        p.id !== product.id &&
        (
          p.category === product.category ||
          p.gender === product.gender
        )
    )
    .slice(0, 4);

  /*
    ------------------------------------------------
    RECENTLY VIEWED PRODUCTS
    ------------------------------------------------
  */

  const recentIds = JSON.parse(
    localStorage.getItem(
      "thrift_recently_viewed"
    ) || "[]"
  );

  const recentlyViewed = recentIds
    .filter(
      (recentId) =>
        String(recentId) !== String(product.id)
    )
    .map((recentId) =>
      products.find(
        (p) => String(p.id) === String(recentId)
      )
    )
    .filter(Boolean)
    .slice(0, 4);

  return (
    <main className="premium-product-page">

      {/* =========================================
          BREADCRUMB
      ========================================== */}

      <div className="premium-breadcrumb">

        <Link to="/shop">
          <ArrowLeft size={14} />
          BACK TO COLLECTION
        </Link>

        <span>
          {product.category}
        </span>

      </div>


      {/* =========================================
          PRODUCT
      ========================================== */}

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

            <span className="premium-condition-badge">
              {stock < 1
                ? "SOLD OUT"
                : product.condition}
            </span>

          </div>

        </div>


        {/* =====================================
            PRODUCT INFORMATION
        ====================================== */}

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


          {/* PRICE */}

          <div className="premium-price">

            <strong>
              {money(product.price)}
            </strong>

            {product.old_price && (
              <del>
                {money(product.old_price)}
              </del>
            )}

            {discount > 0 && (
              <span>
                SAVE {discount}%
              </span>
            )}

          </div>


          {/* STOCK URGENCY */}

          {stock > 0 && stock <= 3 && (
            <div className="product-stock-warning">

              <Clock size={16} />

              <strong>
                Only {stock}{" "}
                {stock === 1
                  ? "piece"
                  : "pieces"}{" "}
                left
              </strong>

            </div>
          )}


          <div className="premium-divider" />


          {/* =====================================
              PRODUCT META
          ====================================== */}

          <div className="premium-product-meta">

            <div>

              <span>
                SIZE
              </span>

              <strong>
                {product.size || "ONE SIZE"}
              </strong>

            </div>


            <div>

              <span>
                CONDITION
              </span>

              <strong>
                {product.condition ||
                  "PRE-LOVED"}
              </strong>

            </div>


            <div>

              <span>
                AVAILABILITY
              </span>

              <strong
                className={
                  stock > 0
                    ? "in-stock"
                    : "sold-stock"
                }
              >
                {stock > 0
                  ? "IN STOCK"
                  : "SOLD OUT"}
              </strong>

            </div>

          </div>


          {/* =====================================
              DESCRIPTION
          ====================================== */}

          <div className="premium-description">

            <p className="description-label">
              ABOUT THIS PIECE
            </p>

            <p>
              {product.description ||
                "A carefully selected pre-loved piece with character, style and a story of its own."}
            </p>

          </div>


          {/* =====================================
              DELIVERY CHECK
          ====================================== */}

          {stock > 0 && (

            <div className="delivery-check">

              <div className="delivery-check-heading">

                <MapPin size={18} />

                <div>
                  <strong>
                    CHECK DELIVERY
                  </strong>

                  <small>
                    Enter your pincode to check availability.
                  </small>
                </div>

              </div>


              <div className="delivery-input-row">

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    );

                    setDeliveryMessage("");
                  }}
                />

                <button
                  type="button"
                  onClick={checkDelivery}
                >
                  CHECK
                </button>

              </div>


              {deliveryMessage && (
                <p
                  className={
                    deliveryMessage.includes(
                      "valid"
                    )
                      ? "delivery-error"
                      : "delivery-success"
                  }
                >
                  {deliveryMessage}
                </p>
              )}

            </div>

          )}


          {/* =====================================
              PURCHASE
          ====================================== */}

          {stock > 0 ? (

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
                  disabled={qty >= stock}
                  onClick={() =>
                    setQty((q) =>
                      Math.min(
                        stock,
                        q + 1
                      )
                    )
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
                <ArrowRight size={17} />
              </button>

            </div>

          ) : (

            <div className="premium-sold-message">
              THIS PIECE HAS FOUND A NEW HOME.
            </div>

          )}


          {/* =====================================
              BUY NOW
          ====================================== */}

          {stock > 0 && (

            <button
              type="button"
              className="premium-buy-now"
              onClick={buyNow}
            >
              BUY NOW
              <ArrowRight size={17} />
            </button>

          )}


          {/* =====================================
              BENEFITS
          ====================================== */}

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
      ========================================== */}

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


      {/* =========================================
          RELATED PRODUCTS
      ========================================== */}

      {relatedProducts.length > 0 && (

        <section className="product-recommendations">

          <div className="section-head">

            <div>

              <p className="eyebrow">
                YOU MAY ALSO LIKE
              </p>

              <h2>
                More pieces to explore.
              </h2>

            </div>

            <Link to="/shop">
              VIEW ALL
            </Link>

          </div>


          <div className="grid">

            {relatedProducts.map((p) => (

              <article
                className="product premium-product"
                key={p.id}
              >

                <Link
                  to={`/product/${p.id}`}
                  className="photo premium-product-photo"
                >

                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                  />

                  <div className="product-number">
                    {String(p.id).padStart(2, "0")}
                  </div>

                  <span className="product-condition">
                    {p.stock < 1
                      ? "SOLD OUT"
                      : p.condition}
                  </span>

                </Link>


                <div className="info premium-product-info">

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


                <button
                  className="add premium-add"
                  disabled={p.stock < 1}
                  onClick={() =>
                    p.stock > 0 && add(p)
                  }
                >
                  {p.stock < 1
                    ? "SOLD OUT"
                    : "ADD TO BAG"}

                  {p.stock > 0 && (
                    <ArrowRight size={15} />
                  )}

                </button>

              </article>

            ))}

          </div>

        </section>

      )}


      {/* =========================================
          RECENTLY VIEWED
      ========================================== */}

      {recentlyViewed.length > 0 && (

        <section className="product-recommendations">

          <div className="section-head">

            <div>

              <p className="eyebrow">
                KEEP EXPLORING
              </p>

              <h2>
                Recently viewed.
              </h2>

            </div>

          </div>


          <div className="grid">

            {recentlyViewed.map((p) => (

              <article
                className="product premium-product"
                key={p.id}
              >

                <Link
                  to={`/product/${p.id}`}
                  className="photo premium-product-photo"
                >

                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                  />

                  <div className="product-number">
                    {String(p.id).padStart(2, "0")}
                  </div>

                  <span className="product-condition">
                    {p.stock < 1
                      ? "SOLD OUT"
                      : p.condition}
                  </span>

                </Link>


                <div className="info premium-product-info">

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
                  </strong>

                </div>

              </article>

            ))}

          </div>

        </section>

      )}

    </main>
  );
}
