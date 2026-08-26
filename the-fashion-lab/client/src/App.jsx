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

const money = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function Header({
  cart,
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

          <Link className="icon" to="/account">
            <User />
          </Link>

          <button
            className="icon"
            onClick={() => setCartOpen(true)}
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
    <article className="product">
      <Link to={"/product/" + p.id} className="photo">
        <img src={p.image} alt={p.name} />

        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(p.id);
          }}
        >
          <Heart
            fill={
              wish.includes(p.id)
                ? "currentColor"
                : "none"
            }
          />
        </button>

        <span>
          {p.stock < 1 ? "Sold out" : p.condition}
        </span>
      </Link>

      <div className="info">
        <div>
          <small>
            {p.category} · {p.size}
          </small>

          <h3>{p.name}</h3>
        </div>

        <strong>
          {money(p.price)}{" "}
          {p.old_price && (
            <del>{money(p.old_price)}</del>
          )}
        </strong>
      </div>

      <button
        className="add"
        onClick={() => p.stock > 0 && add(p)}
        disabled={p.stock < 1}
      >
        {p.stock < 1 ? "SOLD OUT" : "ADD TO BAG"}
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
        <span>VINTAGE</span>
      </div>
    </Link>

    <Link to="/shop" className="style-category">
      <div className="style-category-image streetwear">
        <span>STREETWEAR</span>
      </div>
    </Link>

    <Link to="/shop" className="style-category">
      <div className="style-category-image casual">
        <span>CASUAL</span>
      </div>
    </Link>

    <Link to="/shop" className="style-category">
      <div className="style-category-image jackets">
        <span>JACKETS</span>
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
    <p className="eyebrow">THE FASHION LAB JOURNAL</p>

    <h2>
      Stay in the
      <br />
      <em>loop.</em>
    </h2>

    <p className="newsletter-text">
      Get first access to new drops, exclusive pieces,
      styling inspiration and stories from The Fashion Lab.
    </p>

    <form onSubmit={(e) => e.preventDefault()}>
      <input
        type="email"
        placeholder="Enter your email address"
        required
      />

      <button className="newsletter-button">
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

  const list = products.filter(
    (p) =>
      (cat === "All" || p.category === cat) &&
      `${p.name} ${p.category} ${p.gender}`
        .toLowerCase()
        .includes(q.toLowerCase())
  );

  return (
    <main className="page">
      <p className="eyebrow">
        THE CURRENT DROP
      </p>

      <h1>
        Shop the collection.
      </h1>

      <div className="shop-tools">
        <div className="filters">
          {[
            "All",
            "Vintage",
            "Streetwear",
            "Casual"
          ].map((c) => (
            <button
              className={cat === c ? "active" : ""}
              onClick={() => setCat(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search..."
        />
      </div>

      <div className="grid">
        {list.map((p) => (
          <Card
            key={p.id}
            p={p}
            {...props}
          />
        ))}
      </div>
    </main>
  );
}

function Cart({ cart, setCart, close }) {
  const nav = useNavigate();

  const total = cart.reduce(
    (s, i) => s + i.price * i.qty,
    0
  );

  return (
    <div
      className="overlay"
      onClick={close}
    >
      <aside
        className="cart"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cart-head">
          <h2>Your Bag</h2>

          <button
            className="icon"
            onClick={close}
          >
            <X />
          </button>
        </div>

        {!cart.length ? (
          <div className="empty">
            Your bag is waiting.
            <br />

            <Link
              to="/shop"
              onClick={close}
            >
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((i) => (
                <div
                  className="cart-item"
                  key={i.id}
                >
                  <img
                    src={i.image}
                    alt={i.name}
                  />

                  <div>
                    <strong>
                      {i.name}
                    </strong>

                    <span>
                      {money(i.price)}
                    </span>

                    <div className="qty">
                      <button
                        onClick={() =>
                          setCart((c) =>
                            c.map((x) =>
                              x.id === i.id
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
                        -
                      </button>

                      {i.qty}

                      <button
                        onClick={() =>
                          setCart((c) =>
                            c.map((x) =>
                              x.id === i.id
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

                      <button
                        onClick={() =>
                          setCart((c) =>
                            c.filter(
                              (x) =>
                                x.id !== i.id
                            )
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-bottom">
              <div>
                <span>Subtotal</span>
                <strong>
                  {money(total)}
                </strong>
              </div>

              <small>
                Shipping calculated at checkout.
              </small>

              <button
                className="button dark checkout"
                onClick={() => {
                  close();
                  nav("/checkout");
                }}
              >
                CHECKOUT
                <ArrowRight size={17} />
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
