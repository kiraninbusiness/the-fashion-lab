import React, { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  User,
  Heart,
  ArrowRight,
  Instagram,
  Recycle,
  Sparkles,
  Truck
} from "lucide-react";

import { api } from "./api";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import Wishlist from "./pages/Wishlist";

const money = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function Header({
  cart,
  wish,
  user,
  openMenu,
  setOpenMenu,
  setCartOpen
}) {
  return (
    <>
      <div className="announcement">
        FREE SHIPPING ON ORDERS OVER ₹1,499 · PRE-LOVED, RE-LOVED
      </div>

      <header className="nav">
        <button
          className="icon mobile"
          onClick={() => setOpenMenu(!openMenu)}
        >
          {openMenu ? <X /> : <Menu />}
        </button>

        <Link className="logo" to="/">
          <img src="/Logo.png" alt="The Fashion Lab" />
        </Link>

        <nav className={openMenu ? "links open" : "links"}>
          <Link onClick={() => setOpenMenu(false)} to="/">
            Home
          </Link>

          <Link onClick={() => setOpenMenu(false)} to="/shop">
            Shop
          </Link>

          <a href="/#story">Our Story</a>
          <a href="/#contact">Contact</a>

          {user?.role === "admin" && (
            <Link onClick={() => setOpenMenu(false)} to="/admin">
              Admin
            </Link>
          )}
        </nav>

<div className="actions">

  <label className="search">
    <Search size={17} />

    <input
      placeholder="Search pieces..."
      onKeyDown={(e) =>
        e.key === "Enter" &&
        (window.location.href =
          "/shop?search=" +
          encodeURIComponent(e.currentTarget.value))
      }
    />
  </label>

  {/* WISHLIST */}
  <Link
    className="icon wishlist-header-icon"
    to="/wishlist"
    aria-label="Wishlist"
  >
    <Heart />

    {wish?.length > 0 && (
      <b>{wish.length}</b>
    )}
  </Link>

  {/* ACCOUNT */}
  <Link
    className="icon"
    to="/account"
    aria-label="Account"
  >
    <User />
  </Link>

  {/* BAG */}
  <button
    className="icon"
    onClick={() => setCartOpen(true)}
    aria-label="Shopping bag"
  >
    <ShoppingBag />

    {cart.length > 0 && (
      <b>
        {cart.reduce((s, i) => s + i.qty, 0)}
      </b>
    )}
  </button>

</div>
      </header>
    </>
  );
}

function Card({ p, add, wish, toggle }) {
  return (
    <article className="product premium-product">

      <Link
        to={"/product/" + p.id}
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

        <button
          className="product-heart"
          aria-label="Add to wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(p.id);
          }}
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            fill={
              wish.includes(p.id)
                ? "currentColor"
                : "none"
            }
          />
        </button>

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
        onClick={() => p.stock > 0 && add(p)}
        disabled={p.stock < 1}
      >
        {p.stock < 1
          ? "SOLD OUT"
          : "ADD TO BAG"}

        {p.stock > 0 && (
          <ArrowRight size={15} />
        )}
      </button>

    </article>
  );
}
function Home({ products, ...props }) {
  return (
    <main>
      <section className="premium-hero">

        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              CURATED PRE-LOVED FASHION
            </p>

            <h1>
              STYLE
              <br />
              <em>DESERVES</em>
              <br />
              A SECOND LIFE.
            </h1>

            <p>
              Unique pieces. Better prices. Less waste.
              Discover clothes with character and give
              them another story.
            </p>

            <Link className="button dark" to="/shop">
              SHOP THE DROP
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="hero-image">
            <span>
              01
              <br />
              <small>NEW DROP</small>
            </span>
          </div>
        </section>

        <section className="values">
          <div>
            <Recycle />

            <span>
              <strong>FASHION, CIRCULAR</strong>
              Extending the life of great clothes.
            </span>
          </div>

          <div>
            <Sparkles />

            <span>
              <strong>HANDPICKED</strong>
              Every piece is selected with care.
            </span>
          </div>

          <div>
            <Truck />

            <span>
              <strong>SHIPPED WITH CARE</strong>
              Fast delivery across India.
            </span>
          </div>
        </section>
<section className="style-categories">
  <div className="section-head">
    <div>
      <p className="eyebrow">EXPLORE YOUR STYLE</p>
      <h2>Shop by style.</h2>
    </div>

    <Link to="/shop">VIEW ALL</Link>
  </div>

  <div className="style-category-grid">

  <Link to="/shop" className="style-category">
    <div className="style-category-image vintage">
      <div className="category-overlay">
        <span>01</span>
        <h3>VINTAGE</h3>
        <small>TIMELESS PIECES</small>
      </div>
    </div>
  </Link>

  <Link to="/shop" className="style-category">
    <div className="style-category-image streetwear">
      <div className="category-overlay">
        <span>02</span>
        <h3>STREETWEAR</h3>
        <small>URBAN ESSENTIALS</small>
      </div>
    </div>
  </Link>

  <Link to="/shop" className="style-category">
    <div className="style-category-image casual">
      <div className="category-overlay">
        <span>03</span>
        <h3>CASUAL</h3>
        <small>EVERYDAY STYLE</small>
      </div>
    </div>
  </Link>

  <Link to="/shop" className="style-category">
    <div className="style-category-image jackets">
      <div className="category-overlay">
        <span>04</span>
        <h3>JACKETS</h3>
        <small>OUTER LAYERS</small>
      </div>
    </div>
  </Link>

</div>
</section>
        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">
                THE CURRENT DROP
              </p>

              <h2>
                Find your next favourite.
              </h2>
            </div>

            <Link to="/shop">
              VIEW ALL
            </Link>
          </div>

          <div className="grid">
            {products
              .slice(0, 4)
              .map((p) => (
                <Card
                  key={p.id}
                  p={p}
                  {...props}
                />
              ))}
          </div>
        </section>
<section className="trust-section">
  <div className="trust-heading">
    <p className="eyebrow">THE FASHION LAB PROMISE</p>
    <h2>Why shop with us?</h2>
    <p>
      Thoughtfully selected pieces, carefully checked and
      delivered with care.
    </p>
  </div>

  <div className="trust-grid">

    <div className="trust-card">
      <div className="trust-number">01</div>
      <h3>HANDPICKED</h3>
      <p>
        Every piece is carefully selected for its style,
        quality and individuality.
      </p>
    </div>

    <div className="trust-card">
      <div className="trust-number">02</div>
      <h3>QUALITY CHECKED</h3>
      <p>
        We inspect every item before it becomes part of
        The Fashion Lab collection.
      </p>
    </div>

    <div className="trust-card">
      <div className="trust-number">03</div>
      <h3>SECURE CHECKOUT</h3>
      <p>
        A simple and secure shopping experience from
        selection to payment.
      </p>
    </div>

    <div className="trust-card">
      <div className="trust-number">04</div>
      <h3>DELIVERED WITH CARE</h3>
      <p>
        Carefully packed and shipped across India,
        straight to your door.
      </p>
    </div>

  </div>
</section>
        <section className="brand-story" id="story">
  <div className="brand-story-image">
    <span>THE FASHION LAB</span>
  </div>

  <div className="brand-story-content">
    <p className="eyebrow">OUR PHILOSOPHY</p>

    <h2>
      WEAR THE
      <br />
      <em>STORY.</em>
    </h2>

    <p className="brand-story-lead">
      Great fashion deserves more than one life.
    </p>

    <p>
      The Fashion Lab is a curated destination for pre-loved pieces
      with character, quality and a story worth continuing.
    </p>

    <p>
      We believe personal style shouldn't come at the cost of
      unnecessary waste. Every piece gets a second chance — and
      your wardrobe gets something truly different.
    </p>

    <Link to="/shop" className="story-link">
      DISCOVER THE COLLECTION
      <ArrowRight size={17} />
    </Link>
  </div>
</section>

        <section className="premium-newsletter" id="contact">
  <div className="newsletter-inner">

    <p className="eyebrow">
      THE FASHION LAB JOURNAL
    </p>

    <h2>
      Stay in the
      <br />
      <em>loop.</em>
    </h2>

    <p className="newsletter-text">
      Get first access to new drops, exclusive pieces,
      styling inspiration and stories from The Fashion Lab.
    </p>

    <form
      onSubmit={(e) => {
        e.preventDefault();

        const email = e.target.email.value;

        if (!email) return;

        alert(
          `Thank you! ${email} has been added to The Fashion Lab Journal.`
        );

        e.target.reset();
      }}
    >

      <input
        name="email"
        type="email"
        placeholder="Enter your email address"
        required
      />

      <button
        type="submit"
        className="newsletter-button"
      >
        JOIN THE LAB
        <ArrowRight size={16} />
      </button>

    </form>

    <small>
      No spam. Just good fashion.
    </small>

  </div>
</section>
</section>
</main>
);
}
function Shop({ products, ...props }) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");

  const filtered = products.filter((p) => {
    const matchesCategory =
      cat === "All" || p.category === cat;

    const matchesSearch =
      `${p.name} ${p.category} ${p.gender} ${p.size}`
        .toLowerCase()
        .includes(q.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const list = [...filtered].sort((a, b) => {
    if (sort === "price-low") {
      return Number(a.price) - Number(b.price);
    }

    if (sort === "price-high") {
      return Number(b.price) - Number(a.price);
    }

    if (sort === "newest") {
      return Number(b.id) - Number(a.id);
    }

    return 0;
  });

  const clearFilters = () => {
    setCat("All");
    setQ("");
    setSort("featured");
  };

  return (
    <main className="page shop-page">

      <div className="shop-heading">

        <div>
          <p className="eyebrow">
            THE CURRENT DROP
          </p>

          <h1>
            Shop the collection.
          </h1>

          <p className="shop-result-count">
            {list.length}{" "}
            {list.length === 1 ? "piece" : "pieces"}
          </p>
        </div>

      </div>

      <div className="shop-tools">

        <div className="filters">
          {[
            "All",
            "Vintage",
            "Streetwear",
            "Casual"
          ].map((c) => (
            <button
              type="button"
              className={cat === c ? "active" : ""}
              onClick={() => setCat(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="shop-controls">

          <input
            value={q}
            onChange={(e) =>
              setQ(e.target.value)
            }
            placeholder="Search pieces..."
          />

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
          >
            <option value="featured">
              Featured
            </option>

            <option value="newest">
              Newest
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>
          </select>

        </div>

      </div>

      {(cat !== "All" || q || sort !== "featured") && (
        <button
          type="button"
          className="clear-filters"
          onClick={clearFilters}
        >
          CLEAR FILTERS
        </button>
      )}

      {list.length > 0 ? (

        <div className="grid">

          {list.map((p) => (
            <Card
              key={p.id}
              p={p}
              {...props}
            />
          ))}

        </div>

      ) : (

        <section className="shop-empty">

          <p className="eyebrow">
            NO PIECES FOUND
          </p>

          <h2>
            Nothing matches
            <br />
            <em>your search.</em>
          </h2>

          <p>
            Try another search or clear your filters
            to explore the full collection.
          </p>

          <button
            type="button"
            className="button dark"
            onClick={clearFilters}
          >
            VIEW ALL PIECES
            <ArrowRight size={16} />
          </button>

        </section>

      )}

    </main>
  );
}

function Cart({ cart, setCart, close }) {
  const nav = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const freeShipping = 1499;
  const remaining = Math.max(
    freeShipping - total,
    0
  );

  const progress = Math.min(
    (total / freeShipping) * 100,
    100
  );

  return (
    <div className="overlay" onClick={close}>

      <aside
        className="cart premium-cart"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="cart-head premium-cart-head">
          <div>
            <p className="eyebrow">THE FASHION LAB</p>
            <h2>Your Bag</h2>
          </div>

          <button
            className="icon"
            onClick={close}
            aria-label="Close bag"
          >
            <X />
          </button>
        </div>

        {!cart.length ? (

          <div className="premium-empty-cart">

            <div className="empty-bag-icon">
              <ShoppingBag size={32} />
            </div>

            <p className="eyebrow">
              YOUR BAG IS EMPTY
            </p>

            <h3>
              Nothing here
              <br />
              <em>yet.</em>
            </h3>

            <p>
              Discover unique pre-loved pieces
              and give them another story.
            </p>

            <Link
              to="/shop"
              className="button dark"
              onClick={close}
            >
              EXPLORE THE COLLECTION
              <ArrowRight size={16} />
            </Link>

          </div>

        ) : (

          <>

            <div className="shipping-progress">

              {remaining > 0 ? (
                <p>
                  Add{" "}
                  <strong>
                    {money(remaining)}
                  </strong>{" "}
                  more for FREE shipping.
                </p>
              ) : (
                <p>
                  <strong>
                    You've unlocked FREE shipping.
                  </strong>
                </p>
              )}

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progress}%`
                  }}
                />
              </div>

            </div>

            <div className="cart-items premium-cart-items">

              {cart.map((item) => (

                <div
                  className="cart-item premium-cart-item"
                  key={item.id}
                >

                  <Link
                    to={`/product/${item.id}`}
                    onClick={close}
                    className="cart-product-image"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                    />
                  </Link>

                  <div className="cart-product-info">

                    <small>
                      {item.category}
                    </small>

                    <strong>
                      {item.name}
                    </strong>

                    <span className="cart-price">
                      {money(item.price)}
                    </span>

                    <div className="cart-product-bottom">

                      <div className="qty">

                        <button
                          type="button"
                          onClick={() =>
                            setCart((c) =>
                              c.map((x) =>
                                x.id === item.id
                                  ? {
                                      ...x,
                                      qty: Math.max(
                                        1,
                                        x.qty - 1
                                      )
                                    }
                                  : x
                              )
                            )
                          }
                        >
                          −
                        </button>

                        <span>{item.qty}</span>

                        <button
                          type="button"
                          onClick={() =>
                            setCart((c) =>
                              c.map((x) =>
                                x.id === item.id
                                  ? {
                                      ...x,
                                      qty: x.qty + 1
                                    }
                                  : x
                              )
                            )
                          }
                        >
                          +
                        </button>

                      </div>

                      <button
                        className="remove-item"
                        type="button"
                        onClick={() =>
                          setCart((c) =>
                            c.filter(
                              (x) =>
                                x.id !== item.id
                            )
                          )
                        }
                      >
                        REMOVE
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

            <div className="cart-bottom premium-cart-bottom">

              <div className="cart-total-row">
                <span>SUBTOTAL</span>
                <strong>
                  {money(total)}
                </strong>
              </div>

              <p className="cart-note">
                Shipping calculated at checkout.
              </p>

              <button
                className="button dark checkout premium-checkout"
                onClick={() => {
                  close();
                  nav("/checkout");
                }}
              >
                PROCEED TO CHECKOUT
                <ArrowRight size={17} />
              </button>

              <button
                className="continue-shopping"
                onClick={close}
              >
                CONTINUE SHOPPING
              </button>

            </div>

          </>

        )}

      </aside>

    </div>
  );
}

function Footer() {
  return (
    <footer className="premium-footer">
      <div className="footer-main">

        <div className="footer-brand">
          <Link className="footer-logo" to="/">
            THE FASHION
            <span>LAB</span>
          </Link>

          <p>
            Pre-loved. Re-loved. Re-styled.
          </p>

          <a
            href="https://instagram.com/thefashionlab"
            target="_blank"
            rel="noreferrer"
            className="instagram-link"
          >
            <Instagram size={18} />
            @thefashionlab
          </a>
        </div>

        <div className="footer-column">
          <h4>SHOP</h4>

          <Link to="/shop">New Arrivals</Link>
          <Link to="/shop">Vintage</Link>
          <Link to="/shop">Streetwear</Link>
          <Link to="/shop">Casual</Link>
        </div>

        <div className="footer-column">
          <h4>ABOUT</h4>

          <a href="/#story">Our Story</a>
          <a href="/#story">Our Philosophy</a>
          <Link to="/shop">The Collection</Link>
          <a href="/#contact">Contact</a>
        </div>

        <div className="footer-column">
          <h4>HELP</h4>

          <a href="/#contact">Shipping</a>
          <a href="/#contact">Returns</a>
          <a href="/#contact">FAQ</a>
          <Link to="/account">My Account</Link>
        </div>

      </div>

      <div className="footer-bottom">
        <span>
          © 2026 The Fashion Lab. All rights reserved.
        </span>

        <span>
          PRE-LOVED · RE-LOVED · RE-STYLED
        </span>
      </div>
    </footer>
  );
}

export default function App() {
  const [products, setProducts] =
    useState([]);

  const [cart, setCart] = useState(() =>
    JSON.parse(
      localStorage.getItem("thrift_cart") ||
        "[]"
    )
  );

  const [wish, setWish] = useState(() =>
    JSON.parse(
      localStorage.getItem("thrift_wish") ||
        "[]"
    )
  );

  const [user, setUser] = useState(() =>
    JSON.parse(
      localStorage.getItem("thrift_user") ||
        "null"
    )
  );

  const [cartOpen, setCartOpen] =
    useState(false);

  const [openMenu, setOpenMenu] =
    useState(false);

  useEffect(() => {
    api("/products")
      .then(setProducts)
      .catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "thrift_cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(
      "thrift_wish",
      JSON.stringify(wish)
    );
  }, [wish]);

  const add = (p) =>
    setCart((c) => {
      const x = c.find(
        (i) => i.id === p.id
      );

      return x
        ? c.map((i) =>
            i.id === p.id
              ? {
                  ...i,
                  qty: i.qty + 1
                }
              : i
          )
        : [
            ...c,
            {
              ...p,
              qty: 1
            }
          ];
    });

  const toggle = (id) =>
    setWish((w) =>
      w.includes(id)
        ? w.filter((x) => x !== id)
        : [...w, id]
    );

  return (
    <div className="site">
      <Header
  cart={cart}
  wish={wish}
  user={user}
  openMenu={openMenu}
  setOpenMenu={setOpenMenu}
  setCartOpen={setCartOpen}
/>

      <Routes>
        <Route
          path="/"
          element={
            <Home
              products={products}
              add={add}
              wish={wish}
              toggle={toggle}
            />
          }
        />

        <Route
          path="/shop"
          element={
            <Shop
              products={products}
              add={add}
              wish={wish}
              toggle={toggle}
            />
          }
        />

        <Route
          path="/product/:id"
          element={
            <ProductDetails
              products={products}
              add={add}
              wishlist={wish}
              toggle={toggle}
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <Checkout
              cart={cart}
              user={user}
              clearCart={() =>
                setCart([])
              }
            />
          }
        />

        <Route
          path="/success"
          element={<Success />}
        />
<Route
  path="/wishlist"
  element={
    <Wishlist
      products={products}
      wishlist={wish}
      toggle={toggle}
      add={add}
    />
  }
/>
        <Route
          path="/account"
          element={
            <Account
              user={user}
              setUser={setUser}
            />
          }
        />

        <Route
          path="/admin"
          element={
            <Admin user={user} />
          }
        />
      </Routes>

      <Footer />

      {cartOpen && (
        <Cart
          cart={cart}
          setCart={setCart}
          close={() =>
            setCartOpen(false)
          }
        />
      )}
    </div>
  );
}
