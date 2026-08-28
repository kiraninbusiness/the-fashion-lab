import React, { useEffect, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";

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


/* =========================================================
   HELPERS
========================================================= */

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;


const getStored = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);

    return value
      ? JSON.parse(value)
      : fallback;
  } catch {
    return fallback;
  }
};


/* =========================================================
   HEADER
========================================================= */

function Header({
  cart,
  wish,
  user,
  openMenu,
  setOpenMenu,
  setCartOpen
}) {

  const navigate = useNavigate();

  const [searchValue, setSearchValue] =
    useState("");

  const cartCount = cart.reduce(
    (sum, item) =>
      sum + Number(item.qty || 0),
    0
  );


  const handleSearch = (e) => {

    if (e.key !== "Enter") return;

    const value =
      searchValue.trim();

    if (!value) {
      navigate("/shop");
      return;
    }

    setOpenMenu(false);

    navigate(
      `/shop?search=${encodeURIComponent(
        value
      )}`
    );
  };


  return (
    <>
      {/* ANNOUNCEMENT */}

      <div className="announcement">
        FREE SHIPPING ON ORDERS OVER ₹1,499
        {" · "}
        PRE-LOVED, RE-LOVED
      </div>


      {/* NAVIGATION */}

      <header className="nav">

        {/* MOBILE MENU */}

        <button
          type="button"
          className="icon mobile"
          onClick={() =>
            setOpenMenu((v) => !v)
          }
          aria-label="Menu"
        >
          {openMenu ? (
            <X />
          ) : (
            <Menu />
          )}
        </button>


        {/* LOGO */}

        <Link
          className="logo"
          to="/"
          onClick={() =>
            setOpenMenu(false)
          }
        >
          <img
            src="/Logo.png"
            alt="The Fashion Lab"
          />
        </Link>


        {/* NAV LINKS */}

        <nav
          className={
            openMenu
              ? "links open"
              : "links"
          }
        >

          <Link
            to="/"
            onClick={() =>
              setOpenMenu(false)
            }
          >
            Home
          </Link>

          <Link
            to="/shop"
            onClick={() =>
              setOpenMenu(false)
            }
          >
            Shop
          </Link>

          <a
            href="/#story"
            onClick={() =>
              setOpenMenu(false)
            }
          >
            Our Story
          </a>

          <a
            href="/#contact"
            onClick={() =>
              setOpenMenu(false)
            }
          >
            Contact
          </a>

          {user?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() =>
                setOpenMenu(false)
              }
            >
              Admin
            </Link>
          )}

        </nav>


        {/* ACTIONS */}

        <div className="actions">

          {/* SEARCH */}

          <label className="search">

            <Search size={17} />

            <input
              value={searchValue}
              placeholder="Search pieces..."
              aria-label="Search pieces"
              onChange={(e) =>
                setSearchValue(
                  e.target.value
                )
              }
              onKeyDown={handleSearch}
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
            type="button"
            className="icon"
            onClick={() =>
              setCartOpen(true)
            }
            aria-label="Shopping bag"
          >

            <ShoppingBag />

            {cartCount > 0 && (
              <b>{cartCount}</b>
            )}

          </button>

        </div>

      </header>
    </>
  );
}


/* =========================================================
   PRODUCT CARD
========================================================= */

function Card({
  p,
  add,
  wish,
  toggle
}) {

  const [added, setAdded] =
    useState(false);

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


  /*
    If your backend has a created_at field,
    that will be used to determine newness.
    Otherwise IDs are used as fallback.
  */

  const isNew =
    p.created_at
      ? (
          Date.now() -
            new Date(
              p.created_at
            ).getTime()
        ) <
        1000 *
          60 *
          60 *
          24 *
          14
      : Number(p.id) >= 1;


  const isWishlisted =
    wish.includes(p.id);


  const handleAdd = () => {

    if (stock < 1) return;

    add(p);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };


  return (

    <article
      className={`product premium-product ${
        stock < 1
          ? "product-sold-out"
          : ""
      }`}
    >

      {/* IMAGE */}

      <Link
        to={`/product/${p.id}`}
        className="photo premium-product-photo"
      >

        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
        />


        {/* PRODUCT NUMBER */}

        <div className="product-number">
          {String(p.id).padStart(2, "0")}
        </div>


        {/* BADGES */}

        <div className="product-badges">

          {discount > 0 &&
            stock > 0 && (
              <span className="product-sale-badge">
                -{discount}%
              </span>
            )}

          {isNew &&
            stock > 0 && (
              <span className="product-new-badge">
                NEW
              </span>
            )}

        </div>


        {/* WISHLIST */}

        <button
          type="button"
          className="product-heart"
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
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
              isWishlisted
                ? "currentColor"
                : "none"
            }
          />

        </button>


        {/* CONDITION */}

        <span className="product-condition">

          {stock < 1
            ? "SOLD OUT"
            : p.condition ||
              "PRE-LOVED"}

        </span>

      </Link>


      {/* PRODUCT INFO */}

      <div className="info premium-product-info">

        <div>

          <small>

            {p.category}

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

        <strong className="product-price">

          {money(price)}

          {oldPrice > price && (
            <del>
              {money(oldPrice)}
            </del>
          )}

        </strong>

      </div>


      {/* LOW STOCK */}

      {stock > 0 &&
        stock <= 2 && (

          <p className="low-stock-message">

            Only {stock}{" "}
            {stock === 1
              ? "left"
              : "left"}

          </p>

        )}


      {/* ADD TO BAG */}

      <button
        type="button"
        className={`add premium-add ${
          added
            ? "added-to-bag"
            : ""
        }`}
        onClick={handleAdd}
        disabled={stock < 1}
      >

        {stock < 1 ? (

          "SOLD OUT"

        ) : added ? (

          <>
            ADDED TO BAG
            <span>✓</span>
          </>

        ) : (

          <>
            ADD TO BAG
            <ArrowRight size={15} />
          </>

        )}

      </button>

    </article>
  );
}


/* =========================================================
   HOME
========================================================= */

function Home({
  products,
  ...props
}) {

  return (

    <main>

      {/* HERO */}

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
              Unique pieces. Better prices.
              Less waste. Discover clothes
              with character and give them
              another story.
            </p>

            <Link
              className="button dark"
              to="/shop"
            >
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


        {/* VALUES */}

        <section className="values">

          <div>

            <Recycle />

            <span>
              <strong>
                FASHION, CIRCULAR
              </strong>

              Extending the life of
              great clothes.
            </span>

          </div>


          <div>

            <Sparkles />

            <span>
              <strong>
                HANDPICKED
              </strong>

              Every piece is selected
              with care.
            </span>

          </div>


          <div>

            <Truck />

            <span>
              <strong>
                SHIPPED WITH CARE
              </strong>

              Fast delivery across India.
            </span>

          </div>

        </section>


        {/* STYLE CATEGORIES */}

        <section className="style-categories">

          <div className="section-head">

            <div>

              <p className="eyebrow">
                EXPLORE YOUR STYLE
              </p>

              <h2>
                Shop by style.
              </h2>

            </div>

            <Link to="/shop">
              VIEW ALL
            </Link>

          </div>


          <div className="style-category-grid">

            <Link
              to="/shop"
              className="style-category"
            >
              <div className="style-category-image vintage">

                <div className="category-overlay">
                  <span>01</span>
                  <h3>VINTAGE</h3>
                  <small>
                    TIMELESS PIECES
                  </small>
                </div>

              </div>
            </Link>


            <Link
              to="/shop"
              className="style-category"
            >
              <div className="style-category-image streetwear">

                <div className="category-overlay">
                  <span>02</span>
                  <h3>STREETWEAR</h3>
                  <small>
                    URBAN ESSENTIALS
                  </small>
                </div>

              </div>
            </Link>


            <Link
              to="/shop"
              className="style-category"
            >
              <div className="style-category-image casual">

                <div className="category-overlay">
                  <span>03</span>
                  <h3>CASUAL</h3>
                  <small>
                    EVERYDAY STYLE
                  </small>
                </div>

              </div>
            </Link>


            <Link
              to="/shop"
              className="style-category"
            >
              <div className="style-category-image jackets">

                <div className="category-overlay">
                  <span>04</span>
                  <h3>JACKETS</h3>
                  <small>
                    OUTER LAYERS
                  </small>
                </div>

              </div>
            </Link>

          </div>

        </section>


        {/* CURRENT DROP */}

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


        {/* TRUST */}

        <section className="trust-section">

          <div className="trust-heading">

            <p className="eyebrow">
              THE FASHION LAB PROMISE
            </p>

            <h2>
              Why shop with us?
            </h2>

            <p>
              Thoughtfully selected pieces,
              carefully checked and delivered
              with care.
            </p>

          </div>


          <div className="trust-grid">

            <div className="trust-card">
              <div className="trust-number">
                01
              </div>

              <h3>
                HANDPICKED
              </h3>

              <p>
                Every piece is carefully
                selected for its style,
                quality and individuality.
              </p>
            </div>


            <div className="trust-card">
              <div className="trust-number">
                02
              </div>

              <h3>
                QUALITY CHECKED
              </h3>

              <p>
                We inspect every item before
                it becomes part of The Fashion
                Lab collection.
              </p>
            </div>


            <div className="trust-card">
              <div className="trust-number">
                03
              </div>

              <h3>
                SECURE CHECKOUT
              </h3>

              <p>
                A simple and secure shopping
                experience from selection
                to payment.
              </p>
            </div>


            <div className="trust-card">
              <div className="trust-number">
                04
              </div>

              <h3>
                DELIVERED WITH CARE
              </h3>

              <p>
                Carefully packed and shipped
                across India, straight to
                your door.
              </p>
            </div>

          </div>

        </section>


        {/* STORY */}

        <section
          className="brand-story"
          id="story"
        >

          <div className="brand-story-image">
            <span>
              THE FASHION LAB
            </span>
          </div>


          <div className="brand-story-content">

            <p className="eyebrow">
              OUR PHILOSOPHY
            </p>

            <h2>
              WEAR THE
              <br />
              <em>STORY.</em>
            </h2>

            <p className="brand-story-lead">
              Great fashion deserves
              more than one life.
            </p>

            <p>
              The Fashion Lab is a curated
              destination for pre-loved pieces
              with character, quality and a
              story worth continuing.
            </p>

            <p>
              We believe personal style
              shouldn't come at the cost of
              unnecessary waste. Every piece
              gets a second chance — and your
              wardrobe gets something truly
              different.
            </p>

            <Link
              to="/shop"
              className="story-link"
            >
              DISCOVER THE COLLECTION
              <ArrowRight size={17} />
            </Link>

          </div>

        </section>


        {/* NEWSLETTER */}

        <section
          className="premium-newsletter"
          id="contact"
        >

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
              Get first access to new drops,
              exclusive pieces, styling
              inspiration and stories from
              The Fashion Lab.
            </p>


            <form
              onSubmit={(e) => {

                e.preventDefault();

                const email =
                  e.target.email.value.trim();

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


/* =========================================================
   SHOP
========================================================= */

function Shop({
  products,
  ...props
}) {

  const [cat, setCat] =
    useState("All");

  const [gender, setGender] =
    useState("All");

  const [size, setSize] =
    useState("All");

  const [price, setPrice] =
    useState("All");

  const [availability, setAvailability] =
    useState("All");

  const [q, setQ] =
    useState("");

  const [sort, setSort] =
    useState("featured");

  const [filterOpen, setFilterOpen] =
    useState(false);


  /* READ URL SEARCH */

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const search =
      params.get("search");

    setQ(search || "");

  }, []);


  /* FILTER OPTIONS */

  const categories = [
    "All",
    ...new Set(
      products
        .map((p) => p.category)
        .filter(Boolean)
    )
  ];


  const genders = [
    "All",
    ...new Set(
      products
        .map((p) => p.gender)
        .filter(Boolean)
    )
  ];


  const sizes = [
    "All",
    ...new Set(
      products
        .map((p) => p.size)
        .filter(Boolean)
    )
  ];


  /* FILTER */

  const filtered =
    products.filter((p) => {

      const matchesCategory =
        cat === "All" ||
        p.category === cat;


      const matchesGender =
        gender === "All" ||
        p.gender === gender;


      const matchesSize =
        size === "All" ||
        p.size === size;


      const stock =
        Number(p.stock) || 0;


      const matchesAvailability =
        availability === "All" ||
        (
          availability === "in-stock" &&
          stock > 0
        ) ||
        (
          availability === "sold-out" &&
          stock < 1
        );


      let matchesPrice = true;


      if (price === "under-500") {

        matchesPrice =
          Number(p.price) < 500;

      }


      if (price === "500-1000") {

        matchesPrice =
          Number(p.price) >= 500 &&
          Number(p.price) <= 1000;

      }


      if (price === "1000-1500") {

        matchesPrice =
          Number(p.price) > 1000 &&
          Number(p.price) <= 1500;

      }


      if (price === "above-1500") {

        matchesPrice =
          Number(p.price) > 1500;

      }


      const searchText = `
        ${p.name || ""}
        ${p.category || ""}
        ${p.gender || ""}
        ${p.size || ""}
        ${p.condition || ""}
        ${p.description || ""}
      `.toLowerCase();


      const matchesSearch =
        searchText.includes(
          q.toLowerCase().trim()
        );


      return (
        matchesCategory &&
        matchesGender &&
        matchesSize &&
        matchesAvailability &&
        matchesPrice &&
        matchesSearch
      );

    });


  /* SORT */

  const list =
    [...filtered].sort((a, b) => {

      if (sort === "price-low") {

        return (
          Number(a.price) -
          Number(b.price)
        );

      }


      if (sort === "price-high") {

        return (
          Number(b.price) -
          Number(a.price)
        );

      }


      if (sort === "newest") {

        return (
          Number(b.id) -
          Number(a.id)
        );

      }


      if (sort === "discount") {

        const discountA =
          Number(a.old_price) >
          Number(a.price)
            ? (
                (
                  Number(a.old_price) -
                  Number(a.price)
                ) /
                Number(a.old_price)
              ) * 100
            : 0;


        const discountB =
          Number(b.old_price) >
          Number(b.price)
            ? (
                (
                  Number(b.old_price) -
                  Number(b.price)
                ) /
                Number(b.old_price)
              ) * 100
            : 0;


        return (
          discountB -
          discountA
        );

      }


      return 0;

    });


  /* CLEAR */

  const clearFilters = () => {

    setCat("All");
    setGender("All");
    setSize("All");
    setPrice("All");
    setAvailability("All");
    setQ("");
    setSort("featured");

    window.history.replaceState(
      {},
      "",
      "/shop"
    );

  };


  const hasFilters =
    cat !== "All" ||
    gender !== "All" ||
    size !== "All" ||
    price !== "All" ||
    availability !== "All" ||
    q !== "" ||
    sort !== "featured";


  return (

    <main className="page shop-page">

      {/* SHOP HEADER */}

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

            {list.length === 1
              ? "piece"
              : "pieces"}

          </p>

        </div>

      </div>


      {/* MOBILE FILTER */}

      <button
        type="button"
        className="mobile-filter-button"
        onClick={() =>
          setFilterOpen(
            (v) => !v
          )
        }
      >
        {filterOpen
          ? "CLOSE FILTERS"
          : "FILTER & SORT"}
      </button>


      {/* FILTER AREA */}

      <div
        className={
          filterOpen
            ? "shop-tools open"
            : "shop-tools"
        }
      >

        {/* CATEGORY */}

        <div className="shop-filter-group">

          <span className="filter-label">
            CATEGORY
          </span>

          <div className="filters">

            {categories.map((c) => (

              <button
                type="button"
                key={c}
                className={
                  cat === c
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setCat(c)
                }
              >
                {c}
              </button>

            ))}

          </div>

        </div>


        {/* GENDER */}

        <div className="shop-filter-group">

          <span className="filter-label">
            SHOP FOR
          </span>

          <div className="filters">

            {genders.map((g) => (

              <button
                type="button"
                key={g}
                className={
                  gender === g
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setGender(g)
                }
              >
                {g}
              </button>

            ))}

          </div>

        </div>


        {/* SIZE */}

        <div className="shop-filter-group">

          <span className="filter-label">
            SIZE
          </span>

          <div className="filters">

            {sizes.map((s) => (

              <button
                type="button"
                key={s}
                className={
                  size === s
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setSize(s)
                }
              >
                {s}
              </button>

            ))}

          </div>

        </div>


        {/* PRICE */}

        <div className="shop-filter-group">

          <span className="filter-label">
            PRICE
          </span>

          <div className="filters">

            {[
              ["All", "ALL"],
              [
                "under-500",
                "UNDER ₹500"
              ],
              [
                "500-1000",
                "₹500 – ₹1,000"
              ],
              [
                "1000-1500",
                "₹1,000 – ₹1,500"
              ],
              [
                "above-1500",
                "ABOVE ₹1,500"
              ]
            ].map(([value, label]) => (

              <button
                type="button"
                key={value}
                className={
                  price === value
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPrice(value)
                }
              >
                {label}
              </button>

            ))}

          </div>

        </div>


        {/* AVAILABILITY */}

        <div className="shop-filter-group">

          <span className="filter-label">
            AVAILABILITY
          </span>

          <div className="filters">

            {[
              ["All", "ALL"],
              [
                "in-stock",
                "IN STOCK"
              ],
              [
                "sold-out",
                "SOLD OUT"
              ]
            ].map(([value, label]) => (

              <button
                type="button"
                key={value}
                className={
                  availability === value
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setAvailability(
                    value
                  )
                }
              >
                {label}
              </button>

            ))}

          </div>

        </div>


        {/* SEARCH + SORT */}

        <div className="shop-controls">

          <input
            value={q}
            onChange={(e) =>
              setQ(e.target.value)
            }
            placeholder="Search pieces..."
            aria-label="Search pieces"
          />


          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            aria-label="Sort products"
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

            <option value="discount">
              Biggest Discount
            </option>

          </select>

        </div>

      </div>


      {/* ACTIVE FILTER BAR */}

      {hasFilters && (

        <div className="active-filter-bar">

          <span>

            {list.length}{" "}

            {list.length === 1
              ? "RESULT"
              : "RESULTS"}

          </span>


          <button
            type="button"
            onClick={clearFilters}
          >
            CLEAR ALL
          </button>

        </div>

      )}


      {/* PRODUCTS */}

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
            Try changing your filters
            or searching for another
            piece.
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


/* =========================================================
   CART
========================================================= */

function Cart({
  cart,
  setCart,
  close
}) {

  const nav = useNavigate();


  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
        Number(item.qty || 0),
      0
    );


  const freeShipping = 1499;


  const remaining =
    Math.max(
      freeShipping - total,
      0
    );


  const progress =
    Math.min(
      (total / freeShipping) * 100,
      100
    );


  return (

    <div
      className="overlay"
      onClick={close}
    >

      <aside
        className="cart premium-cart"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="cart-head premium-cart-head">

          <div>

            <p className="eyebrow">
              THE FASHION LAB
            </p>

            <h2>
              Your Bag
            </h2>

          </div>


          <button
            type="button"
            className="icon"
            onClick={close}
            aria-label="Close bag"
          >
            <X />
          </button>

        </div>


        {/* EMPTY */}

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
              Discover unique pre-loved
              pieces and give them
              another story.
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

            {/* SHIPPING */}

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
                    You've unlocked FREE
                    shipping.
                  </strong>
                </p>

              )}


              <div className="progress-track">

                <div
                  className="progress-fill"
                  style={{
                    width:
                      `${progress}%`
                  }}
                />

              </div>

            </div>


            {/* ITEMS */}

            <div className="cart-items premium-cart-items">

              {cart.map((item) => {

                const stock =
                  Number(item.stock) || 0;

                const qty =
                  Number(item.qty) || 1;


                return (

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

                        {/* QUANTITY */}

                        <div className="qty">

                          <button
                            type="button"
                            onClick={() =>
                              setCart((c) =>
                                c.map((x) =>
                                  x.id === item.id
                                    ? {
                                        ...x,
                                        qty:
                                          Math.max(
                                            1,
                                            Number(
                                              x.qty
                                            ) - 1
                                          )
                                      }
                                    : x
                                )
                              )
                            }
                          >
                            −
                          </button>


                          <span>
                            {qty}
                          </span>


                          <button
                            type="button"
                            disabled={
                              qty >= stock
                            }
                            onClick={() =>
                              setCart((c) =>
                                c.map((x) =>
                                  x.id === item.id
                                    ? {
                                        ...x,
                                        qty:
                                          Math.min(
                                            Number(
                                              x.stock
                                            ) || 1,
                                            Number(
                                              x.qty
                                            ) + 1
                                          )
                                      }
                                    : x
                                )
                              )
                            }
                          >
                            +
                          </button>

                        </div>


                        {/* REMOVE */}

                        <button
                          className="remove-item"
                          type="button"
                          onClick={() =>
                            setCart((c) =>
                              c.filter(
                                (x) =>
                                  x.id !==
                                  item.id
                              )
                            )
                          }
                        >
                          REMOVE
                        </button>

                      </div>


                      {stock > 0 &&
                        qty >= stock && (

                          <small className="stock-limit">
                            Maximum available
                            quantity reached
                          </small>

                        )}

                    </div>

                  </div>

                );

              })}

            </div>


            {/* CART FOOTER */}

            <div className="cart-bottom premium-cart-bottom">

              <div className="cart-total-row">

                <span>
                  SUBTOTAL
                </span>

                <strong>
                  {money(total)}
                </strong>

              </div>


              <p className="cart-note">
                Shipping calculated at checkout.
              </p>


              <button
                type="button"
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
                type="button"
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


/* =========================================================
   FOOTER
========================================================= */

function Footer() {

  return (

    <footer className="premium-footer">

      <div className="footer-main">

        {/* BRAND */}

        <div className="footer-brand">

          <Link
            className="footer-logo"
            to="/"
          >
            THE FASHION
            <span>LAB</span>
          </Link>

          <p>
            Pre-loved. Re-loved.
            Re-styled.
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


        {/* SHOP */}

        <div className="footer-column">

          <h4>
            SHOP
          </h4>

          <Link to="/shop">
            New Arrivals
          </Link>

          <Link to="/shop">
            Vintage
          </Link>

          <Link to="/shop">
            Streetwear
          </Link>

          <Link to="/shop">
            Casual
          </Link>

        </div>


        {/* ABOUT */}

        <div className="footer-column">

          <h4>
            ABOUT
          </h4>

          <a href="/#story">
            Our Story
          </a>

          <a href="/#story">
            Our Philosophy
          </a>

          <Link to="/shop">
            The Collection
          </Link>

          <a href="/#contact">
            Contact
          </a>

        </div>


        {/* HELP */}

        <div className="footer-column">

          <h4>
            HELP
          </h4>

          <a href="/#contact">
            Shipping
          </a>

          <a href="/#contact">
            Returns
          </a>

          <a href="/#contact">
            FAQ
          </a>

          <Link to="/account">
            My Account
          </Link>

        </div>

      </div>


      <div className="footer-bottom">

        <span>
          © 2026 The Fashion Lab.
          All rights reserved.
        </span>

        <span>
          PRE-LOVED · RE-LOVED ·
          RE-STYLED
        </span>

      </div>

    </footer>
  );
}


/* =========================================================
   APP
========================================================= */

export default function App() {

  const [products, setProducts] =
    useState([]);


  const [cart, setCart] =
    useState(() =>
      getStored(
        "thrift_cart",
        []
      )
    );


  const [wish, setWish] =
    useState(() =>
      getStored(
        "thrift_wish",
        []
      )
    );


  const [user, setUser] =
    useState(() =>
      getStored(
        "thrift_user",
        null
      )
    );


  const [cartOpen, setCartOpen] =
    useState(false);


  const [openMenu, setOpenMenu] =
    useState(false);


  /* =====================================================
     LOAD PRODUCTS
  ===================================================== */

  useEffect(() => {

    api("/products")

      .then((latestProducts) => {

        setProducts(
          Array.isArray(
            latestProducts
          )
            ? latestProducts
            : []
        );


        /* UPDATE CART STOCK */

        setCart((currentCart) => {

          return currentCart

            .map((item) => {

              const latest =
                latestProducts.find(
                  (p) =>
                    String(p.id) ===
                    String(item.id)
                );


              /* PRODUCT REMOVED */

              if (!latest) {
                return null;
              }


              const stock =
                Number(
                  latest.stock
                ) || 0;


              /* SOLD OUT */

              if (stock < 1) {
                return null;
              }


              return {

                ...item,
                ...latest,

                qty: Math.min(
                  Number(item.qty) || 1,
                  stock
                )

              };

            })

            .filter(Boolean);

        });

      })

      .catch((error) => {

        console.error(
          "Unable to load products:",
          error
        );

      });

  }, []);


  /* =====================================================
     SAVE CART
  ===================================================== */

  useEffect(() => {

    localStorage.setItem(
      "thrift_cart",
      JSON.stringify(cart)
    );

  }, [cart]);


  /* =====================================================
     SAVE WISHLIST
  ===================================================== */

  useEffect(() => {

    localStorage.setItem(
      "thrift_wish",
      JSON.stringify(wish)
    );

  }, [wish]);


  /* =====================================================
     SAVE USER
  ===================================================== */

  useEffect(() => {

    if (user) {

      localStorage.setItem(
        "thrift_user",
        JSON.stringify(user)
      );

    } else {

      localStorage.removeItem(
        "thrift_user"
      );

    }

  }, [user]);


  /* =====================================================
     ADD TO CART
  ===================================================== */

  const add = (product) => {

    const stock =
      Number(product.stock) || 0;


    if (stock < 1) {
      return;
    }


    setCart((currentCart) => {

      const existing =
        currentCart.find(
          (item) =>
            String(item.id) ===
            String(product.id)
        );


      /* EXISTING PRODUCT */

      if (existing) {

        const currentQty =
          Number(
            existing.qty
          ) || 0;


        if (
          currentQty >= stock
        ) {
          return currentCart;
        }


        return currentCart.map(
          (item) =>
            String(item.id) ===
            String(product.id)
              ? {
                  ...item,
                  ...product,
                  qty: Math.min(
                    stock,
                    currentQty + 1
                  )
                }
              : item
        );

      }


      /* NEW PRODUCT */

      return [

        ...currentCart,

        {
          ...product,
          qty: 1
        }

      ];

    });

  };


  /* =====================================================
     WISHLIST
  ===================================================== */

  const toggle = (id) => {

    setWish((currentWish) => {

      const exists =
        currentWish.includes(id);


      if (exists) {

        return currentWish.filter(
          (item) =>
            item !== id
        );

      }


      return [
        ...currentWish,
        id
      ];

    });

  };


  return (

    <div className="site">

      {/* HEADER */}

      <Header
        cart={cart}
        wish={wish}
        user={user}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        setCartOpen={setCartOpen}
      />


      {/* ROUTES */}

      <Routes>

        {/* HOME */}

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


        {/* SHOP */}

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


        {/* PRODUCT */}

        <Route
          path="/product/:id"
          element={
            <ProductDetails
              products={products}
              add={add}
              wishlist={wish}
              toggle={toggle}
              setCart={setCart}
            />
          }
        />


        {/* CHECKOUT */}

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


        {/* SUCCESS */}

        <Route
          path="/success"
          element={
            <Success />
          }
        />


        {/* WISHLIST */}

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


        {/* ACCOUNT */}

        <Route
          path="/account"
          element={
            <Account
              user={user}
              setUser={setUser}
            />
          }
        />


        {/* ADMIN */}

        <Route
          path="/admin"
          element={
            <Admin
              user={user}
            />
          }
        />

      </Routes>


      {/* FOOTER */}

      <Footer />


      {/* CART */}

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
