import React from "react";
import {Link,useParams} from "react-router-dom";
import {ArrowLeft,Heart,ShoppingBag} from "lucide-react";
export default function ProductDetails({products,add,wishlist,toggle}){
 const {id}=useParams(),p=products.find(x=>String(x.id)===id);
 if(!p)return <main className="page"><h1>Piece not found.</h1><Link to="/shop">Back to shop</Link></main>;
 return <main className="page"><Link className="back" to="/shop"><ArrowLeft size={15}/> Back to shop</Link><div className="detail-grid"><div className="detail-image"><img src={p.image} alt={p.name}/></div><div className="detail-copy"><p className="eyebrow">{p.category} · {p.condition}</p><h1>{p.name}</h1><div className="detail-price">₹{Number(p.price).toLocaleString("en-IN")} {p.old_price&&<del>₹{Number(p.old_price).toLocaleString("en-IN")}</del>}</div><p>{p.description||"A carefully selected pre-loved piece, ready for its next story."}</p><div className="specs"><span>Size<b>{p.size}</b></span><span>Gender<b>{p.gender}</b></span><span>Condition<b>{p.condition}</b></span></div><div className="detail-actions"><button className="button dark" onClick={()=>add(p)}><ShoppingBag size={16}/> ADD TO BAG</button><button className="outline" onClick={()=>toggle(p.id)}><Heart fill={wishlist.includes(p.id)?"currentColor":"none"}/> SAVE</button></div></div></div></main>
}
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
        <p className="eyebrow">THE FASHION LAB</p>
        <h1>Piece not found.</h1>
        <Link to="/shop">
          BACK TO SHOP <ArrowRight size={16} />
        </Link>
      </main>
    );
  }

  const isWishlisted = wishlist.includes(product.id);

  const addToBag = () => {
    for (let i = 0; i < qty; i++) {
      add(product);
    }
  };

  return (
    <main className="product-page">

      <div className="product-breadcrumb">
        <Link to="/shop">
          <ArrowLeft size={15} />
          BACK TO SHOP
        </Link>
      </div>

      <section className="product-detail">

        <div className="product-gallery">

          <div className="main-product-image">
            <img
              src={product.image}
              alt={product.name}
            />

            <button
              className="product-wishlist"
              onClick={() => toggle(product.id)}
              aria-label="Wishlist"
            >
              <Heart
                fill={
                  isWishlisted
                    ? "currentColor"
                    : "none"
                }
              />
            </button>

            <span className="product-condition">
              {product.stock < 1
                ? "SOLD OUT"
                : product.condition}
            </span>
          </div>

        </div>

        <div className="product-information">

          <p className="product-category">
            {product.category} · {product.gender}
          </p>

          <h1>{product.name}</h1>

          <div className="product-price">
            <strong>{money(product.price)}</strong>

            {product.old_price && (
              <del>
                {money(product.old_price)}
              </del>
            )}
          </div>

          <div className="product-divider" />

          <div className="product-meta">
            <div>
              <span>SIZE</span>
              <strong>{product.size || "ONE SIZE"}</strong>
            </div>

            <div>
              <span>CONDITION</span>
              <strong>
                {product.condition || "PRE-LOVED"}
              </strong>
            </div>

            <div>
              <span>AVAILABILITY</span>
              <strong>
                {product.stock > 0
                  ? "IN STOCK"
                  : "SOLD OUT"}
              </strong>
            </div>
          </div>

          <p className="product-description">
            {product.description ||
              "A carefully selected pre-loved piece with character, style and a story of its own."}
          </p>

          {product.stock > 0 && (
            <div className="purchase-area">

              <div className="quantity">
                <button
                  onClick={() =>
                    setQty((q) => Math.max(1, q - 1))
                  }
                >
                  −
                </button>

                <span>{qty}</span>

                <button
                  onClick={() =>
                    setQty((q) =>
                      Math.min(product.stock, q + 1)
                    )
                  }
                >
                  +
                </button>
              </div>

              <button
                className="premium-add-button"
                onClick={addToBag}
              >
                ADD TO BAG
                <ArrowRight size={17} />
              </button>

            </div>
          )}

          <div className="product-benefits">

            <div>
              <Truck size={20} />
              <span>
                <strong>SHIPPED WITH CARE</strong>
                Pan-India delivery.
              </span>
            </div>

            <div>
              <ShieldCheck size={20} />
              <span>
                <strong>QUALITY CHECKED</strong>
                Every piece inspected.
              </span>
            </div>

            <div>
              <RotateCcw size={20} />
              <span>
                <strong>PRE-LOVED, RE-LOVED</strong>
                Giving fashion another life.
              </span>
            </div>

          </div>

        </div>
      </section>

      <section className="product-story">
        <p className="eyebrow">
          THE FASHION LAB
        </p>

        <h2>
          Every piece has
          <br />
          <em>another story.</em>
        </h2>

        <p>
          We believe great clothing deserves more than
          one life. Each piece in our collection is
          selected with care and ready for its next chapter.
        </p>

        <Link to="/shop">
          EXPLORE MORE PIECES
          <ArrowRight size={16} />
        </Link>
      </section>

    </main>
  );
}
