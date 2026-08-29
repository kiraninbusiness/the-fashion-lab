import React, { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight, Search, ShoppingBag, Heart, Menu, X, UserRound,
  ChevronDown, Plus, Minus, Trash2, Star, Truck, ShieldCheck,
  RotateCcw, Instagram, Mail, MapPin, ArrowUpRight
} from "lucide-react";
import { products, categories } from "./data/products";

const money = n => `₹${Number(n).toLocaleString("en-IN")}`;

function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; } catch { return initial; }
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value]);
  return [value, setValue];
}

function App() {
  const [cart, setCart] = useStored("offgrid_cart", []);
  const [wishlist, setWishlist] = useStored("offgrid_wishlist", []);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const addToCart = (product, size = product.sizes[0], qty = 1) => {
    setCart(current => {
      const key = `${product.id}-${size}`;
      const found = current.find(x => x.key === key);
      if (found) return current.map(x => x.key === key ? { ...x, qty: x.qty + qty } : x);
      return [...current, { key, id: product.id, name: product.name, price: product.price, image: product.image, size, qty }];
    });
    setCartOpen(true);
  };

  const updateQty = (key, delta) => setCart(c => c.map(x => x.key === key ? { ...x, qty: Math.max(1, x.qty + delta) } : x));
  const removeFromCart = key => setCart(c => c.filter(x => x.key !== key));
  const toggleWish = id => setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

  const count = cart.reduce((s, x) => s + x.qty, 0);
  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const shipping = subtotal >= 1499 || subtotal === 0 ? 0 : 79;

  return <>
    <ScrollTop />
    <Announcement />
    <Header count={count} wishlistCount={wishlist.length} onCart={() => setCartOpen(true)} onSearch={() => setSearchOpen(true)} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    {menuOpen && <MobileMenu close={() => setMenuOpen(false)} />}
    <Routes>
      <Route path="/" element={<Home add={addToCart} wish={wishlist} toggleWish={toggleWish} />} />
      <Route path="/shop" element={<Shop add={addToCart} wish={wishlist} toggleWish={toggleWish} />} />
      <Route path="/shop/:category" element={<Shop add={addToCart} wish={wishlist} toggleWish={toggleWish} />} />
      <Route path="/product/:id" element={<ProductPage add={addToCart} wish={wishlist} toggleWish={toggleWish} />} />
      <Route path="/wishlist" element={<Wishlist ids={wishlist} add={addToCart} toggleWish={toggleWish} />} />
      <Route path="/account" element={<Account />} />
    </Routes>
    <Footer />
    {searchOpen && <SearchOverlay close={() => setSearchOpen(false)} />}
    {cartOpen && <CartDrawer cart={cart} subtotal={subtotal} shipping={shipping} updateQty={updateQty} remove={removeFromCart} close={() => setCartOpen(false)} />}
  </>;
}

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function Announcement() {
  return <div className="announcement"><span>FREE SHIPPING ON ORDERS ABOVE ₹1,499</span><span className="announcement-hide">7-DAY EASY RETURNS</span><span className="announcement-hide">SECURE CHECKOUT</span></div>;
}

function Header({ count, wishlistCount, onCart, onSearch, menuOpen, setMenuOpen }) {
  return <header className="header">
    <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    <Link to="/" className="logo">THE <span>OFF GRID</span></Link>
    <nav className="desktop-nav">
      <Link to="/shop">SHOP</Link><Link to="/shop/T-Shirts">T-SHIRTS</Link><Link to="/shop/Hoodies">HOODIES</Link><Link to="/shop/Jackets">JACKETS</Link><Link to="/shop/Bottomwear">BOTTOMWEAR</Link>
    </nav>
    <div className="header-actions">
      <button onClick={onSearch} aria-label="Search"><Search/></button>
      <Link to="/account" aria-label="Account"><UserRound/></Link>
      <Link to="/wishlist" className="icon-badge" aria-label="Wishlist"><Heart/>{wishlistCount > 0 && <b>{wishlistCount}</b>}</Link>
      <button onClick={onCart} className="icon-badge" aria-label="Cart"><ShoppingBag/>{count > 0 && <b>{count}</b>}</button>
    </div>
  </header>;
}

function MobileMenu({ close }) {
  return <div className="mobile-menu-panel">
    <Link onClick={close} to="/shop">SHOP ALL</Link>
    {categories.slice(1).map(c => <Link onClick={close} key={c} to={`/shop/${c}`}>{c.toUpperCase()}</Link>)}
    <Link onClick={close} to="/account">ACCOUNT</Link>
    <Link onClick={close} to="/wishlist">WISHLIST</Link>
  </div>;
}

function Home({ add, wish, toggleWish }) {
  return <main>
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">NEW DROP · 01 / 26</p>
        <h1>MOVE<br/><i>DIFFERENT.</i></h1>
        <p>Clothing for people who don't follow the grid. Built for everyday movement, late nights and whatever comes next.</p>
        <div className="hero-buttons"><Link className="button dark" to="/shop">SHOP THE DROP <ArrowRight/></Link><Link className="text-link" to="/shop">EXPLORE ALL</Link></div>
      </div>
      <div className="hero-image"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1500&q=90" alt="The Off Grid fashion campaign"/></div>
      <div className="hero-stamp">THE<br/>OFF<br/>GRID<br/><small>EST. 2026</small></div>
    </section>

    <section className="marquee"><div>NO RULES · NO TEMPLATE · NO SIGNAL · MOVE DIFFERENT · NO RULES · NO TEMPLATE ·</div></section>

    <section className="section">
      <SectionHead eyebrow="THE LATEST" title="Built outside the box" link="/shop" />
      <div className="product-grid">
        {products.slice(0, 4).map(p => <ProductCard key={p.id} p={p} add={add} wished={wish.includes(p.id)} toggleWish={toggleWish}/>)}
      </div>
    </section>

    <section className="split-editorial">
      <div className="editorial-image"><img src="https://images.unsplash.com/photo-1506629905607-d9e5f8d3e3c2?auto=format&fit=crop&w=1200&q=85" alt="Streetwear"/></div>
      <div className="editorial-copy"><p className="eyebrow">THE OFF GRID PHILOSOPHY</p><h2>WEAR<br/><i>YOUR OWN</i><br/>ROUTE.</h2><p>We make uncomplicated pieces with strong silhouettes. Less noise. More identity. Every collection is designed to work together without looking like everyone else.</p><Link className="button outline" to="/shop">DISCOVER THE BRAND <ArrowUpRight/></Link></div>
    </section>

    <section className="section">
      <SectionHead eyebrow="SHOP BY CATEGORY" title="Find your uniform" />
      <div className="category-grid">
        <CategoryTile name="T-SHIRTS" image={products[0].image} />
        <CategoryTile name="HOODIES" image={products[2].image} />
        <CategoryTile name="JACKETS" image={products[3].image} />
        <CategoryTile name="BOTTOMWEAR" image={products[4].image} />
      </div>
    </section>

    <Newsletter />
  </main>;
}

function SectionHead({ eyebrow, title, link }) {
  return <div className="section-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{link && <Link className="text-link" to={link}>VIEW ALL <ArrowRight/></Link>}</div>;
}

function CategoryTile({ name, image }) {
  return <Link to={`/shop/${name[0] + name.slice(1).toLowerCase()}`} className="category-tile"><img src={image} alt={name}/><span>{name}<ArrowUpRight/></span></Link>;
}

function ProductCard({ p, add, wished, toggleWish }) {
  return <article className="product-card">
    <div className="product-image"><Link to={`/product/${p.id}`}><img src={p.image} alt={p.name}/></Link><span className="product-badge">{p.badge}</span><button className={`wish ${wished ? "active":""}`} onClick={() => toggleWish(p.id)}><Heart fill={wished ? "currentColor" : "none"}/></button></div>
    <div className="product-meta"><div><Link to={`/product/${p.id}`} className="product-name">{p.name}</Link><span className="product-category">{p.category}</span></div><div className="product-price"><strong>{money(p.price)}</strong>{p.oldPrice && <del>{money(p.oldPrice)}</del>}</div></div>
    <button className="quick-add" onClick={() => add(p)}>ADD TO BAG <Plus/></button>
  </article>;
}

function Shop({ add, wish, toggleWish }) {
  const { category } = useParams();
  const [filter, setFilter] = useState(category || "All");
  const [sort, setSort] = useState("featured");
  const [search, setSearch] = useState("");
  const shown = useMemo(() => {
    let arr = products.filter(p => (filter === "All" || p.category === filter) && `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase()));
    if (sort === "low") arr = [...arr].sort((a,b)=>a.price-b.price);
    if (sort === "high") arr = [...arr].sort((a,b)=>b.price-a.price);
    if (sort === "new") arr = [...arr].reverse();
    return arr;
  }, [filter, sort, search]);

  return <main className="shop-page">
    <div className="shop-hero"><p className="eyebrow">THE COLLECTION</p><h1>{filter === "All" ? "SHOP ALL" : filter.toUpperCase()}</h1><p>Modern essentials, oversized silhouettes and everyday layers. Find your way out.</p></div>
    <div className="shop-toolbar"><div className="filter-pills">{categories.map(c => <button className={filter===c?"active":""} onClick={()=>setFilter(c)} key={c}>{c}</button>)}</div><div className="sort"><span>{shown.length} PRODUCTS</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="new">Newest</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option></select></div></div>
    <div className="shop-search"><Search/><input placeholder="Search the collection..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
    <div className="product-grid shop-grid">{shown.map(p=><ProductCard key={p.id} p={p} add={add} wished={wish.includes(p.id)} toggleWish={toggleWish}/>)}</div>
  </main>;
}

function ProductPage({ add, wish, toggleWish }) {
  const { id } = useParams();
  const p = products.find(x=>x.id===Number(id)) || products[0];
  const [size, setSize] = useState(p.sizes[0]);
  const [qty, setQty] = useState(1);
  return <main className="product-page">
    <div className="product-detail-image"><img src={p.image} alt={p.name}/><span>{p.badge}</span></div>
    <div className="product-detail-info">
      <p className="eyebrow">{p.category} · {p.gender}</p><h1>{p.name}</h1>
      <div className="detail-rating"><Star fill="currentColor"/><strong>{p.rating}</strong><span>{p.reviews} reviews</span></div>
      <div className="detail-price"><strong>{money(p.price)}</strong>{p.oldPrice && <del>{money(p.oldPrice)}</del>}<em>{Math.round((1-p.price/p.oldPrice)*100)}% OFF</em></div>
      <p className="detail-description">{p.description}</p>
      <div className="detail-block"><div className="label-row"><span>SELECT SIZE</span><button>SIZE GUIDE</button></div><div className="size-grid">{p.sizes.map(s=><button className={size===s?"selected":""} key={s} onClick={()=>setSize(s)}>{s}</button>)}</div></div>
      <div className="detail-buy"><div className="qty"><button onClick={()=>setQty(Math.max(1,qty-1))}><Minus/></button><span>{qty}</span><button onClick={()=>setQty(qty+1)}><Plus/></button></div><button className="button dark buy" onClick={()=>add(p,size,qty)}>ADD TO BAG <ShoppingBag/></button><button className={`detail-wish ${wish.includes(p.id)?"active":""}`} onClick={()=>toggleWish(p.id)}><Heart fill={wish.includes(p.id)?"currentColor":"none"}/></button></div>
      <div className="trust-row"><div><Truck/><span><b>Fast Delivery</b> Across India</span></div><div><RotateCcw/><span><b>Easy Returns</b> Within 7 days</span></div><div><ShieldCheck/><span><b>Secure Payment</b> 100% protected</span></div></div>
    </div>
  </main>;
}

function Wishlist({ ids, add, toggleWish }) {
  const items = products.filter(p=>ids.includes(p.id));
  return <main className="simple-page"><p className="eyebrow">YOUR SAVED PIECES</p><h1>WISHLIST</h1>{items.length ? <div className="product-grid">{items.map(p=><ProductCard key={p.id} p={p} add={add} wished toggleWish={toggleWish}/>)}</div> : <div className="empty-state"><Heart/><h2>Nothing saved yet.</h2><p>When something feels like you, save it here.</p><Link className="button dark" to="/shop">EXPLORE THE COLLECTION <ArrowRight/></Link></div>}</main>;
}

function Account() {
  return <main className="account-page"><div className="account-card"><p className="eyebrow">YOUR OFF GRID</p><h1>ACCOUNT</h1><p>Account, orders and saved pieces will live here. This first version keeps the storefront ready for backend authentication.</p><Link className="button dark" to="/shop">START SHOPPING <ArrowRight/></Link></div></main>;
}

function SearchOverlay({ close }) {
  const [q,setQ]=useState("");
  const results = products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())).slice(0,5);
  return <div className="overlay"><div className="search-modal"><button className="close" onClick={close}><X/></button><p className="eyebrow">SEARCH THE GRID</p><div className="search-big"><Search/><input autoFocus placeholder="What are you looking for?" value={q} onChange={e=>setQ(e.target.value)}/></div>{q && <div className="search-results">{results.map(p=><Link onClick={close} to={`/product/${p.id}`} key={p.id}><img src={p.image}/><span>{p.name}<small>{money(p.price)}</small></span><ArrowRight/></Link>)}</div>}</div></div>;
}

function CartDrawer({ cart, subtotal, shipping, updateQty, remove, close }) {
  const free = Math.max(0,1499-subtotal);
  return <div className="drawer-backdrop" onClick={close}><aside className="cart-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div><p className="eyebrow">YOUR BAG</p><h2>{cart.length} {cart.length===1?"ITEM":"ITEMS"}</h2></div><button onClick={close}><X/></button></div>{cart.length ? <><div className="shipping-progress">{free ? <>ADD <b>{money(free)}</b> MORE FOR FREE SHIPPING<div className="progress"><span style={{width:`${Math.min(100,subtotal/1499*100)}%`}}/></div></> : "YOU'VE UNLOCKED FREE SHIPPING"}</div><div className="cart-items">{cart.map(x=><div className="cart-item" key={x.key}><img src={x.image}/><div><Link to={`/product/${x.id}`} onClick={close}>{x.name}</Link><small>SIZE: {x.size}</small><strong>{money(x.price)}</strong><div className="cart-controls"><button onClick={()=>updateQty(x.key,-1)}><Minus/></button><span>{x.qty}</span><button onClick={()=>updateQty(x.key,1)}><Plus/></button><button className="remove" onClick={()=>remove(x.key)}><Trash2/></button></div></div></div>)}</div><div className="cart-bottom"><div><span>SUBTOTAL</span><strong>{money(subtotal)}</strong></div><small>Shipping calculated at checkout.</small><button className="button dark full" onClick={()=>alert("Checkout is the next build step.")}>CHECKOUT <ArrowRight/></button><Link className="continue" to="/shop" onClick={close}>CONTINUE SHOPPING</Link></div></> : <div className="cart-empty"><ShoppingBag/><h3>Your bag is empty.</h3><p>Looks like you haven't found your next piece yet.</p><Link className="button dark" to="/shop" onClick={close}>SHOP NOW <ArrowRight/></Link></div>}</aside></div>;
}

function Newsletter() {
  const [email,setEmail]=useState("");
  const [sent,setSent]=useState(false);
  return <section className="newsletter"><div><p className="eyebrow">JOIN THE GRID</p><h2>Don't just follow<br/><i>the feed.</i></h2></div><div><p>Get first access to new drops, limited pieces and everything happening off the grid.</p>{sent ? <strong className="sent">YOU'RE IN. WELCOME TO THE GRID.</strong> : <form onSubmit={e=>{e.preventDefault(); if(email) setSent(true)}}><input required type="email" placeholder="Your email address" value={email} onChange={e=>setEmail(e.target.value)}/><button><ArrowRight/></button></form>}<small>By subscribing, you agree to receive updates from THE OFF GRID.</small></div></section>;
}

function Footer() {
  return <footer><div className="footer-main"><div className="footer-brand"><Link className="logo" to="/">THE <span>OFF GRID</span></Link><p>Clothing for people who move differently.</p><div className="socials"><a href="#instagram"><Instagram/></a><a href="#mail"><Mail/></a></div></div><div><h4>SHOP</h4><Link to="/shop">All Products</Link><Link to="/shop/T-Shirts">T-Shirts</Link><Link to="/shop/Hoodies">Hoodies</Link><Link to="/shop/Jackets">Jackets</Link></div><div><h4>HELP</h4><a href="#shipping">Shipping</a><a href="#returns">Returns</a><a href="#size">Size Guide</a><Link to="/account">My Account</Link></div><div><h4>THE BRAND</h4><a href="#about">About Us</a><a href="#contact">Contact</a><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div></div><div className="footer-bottom"><span>© 2026 THE OFF GRID</span><span>MADE FOR THE UNFILTERED.</span><span>INDIA</span></div></footer>;
}

export default App;