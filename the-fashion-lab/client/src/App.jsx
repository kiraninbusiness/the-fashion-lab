import React,{useEffect,useState} from "react";
import {Link,Route,Routes,useNavigate} from "react-router-dom";
import {Menu,X,Search,ShoppingBag,User,Heart,ArrowRight,Instagram,Recycle,Sparkles,Truck} from "lucide-react";
import {api} from "./api";import ProductDetails from "./pages/ProductDetails";import Checkout from "./pages/Checkout";import Success from "./pages/Success";import Account from "./pages/Account";import Admin from "./pages/Admin";
const money=n=>`₹${Number(n).toLocaleString("en-IN")}`;
function Header({cart,user,openMenu,setOpenMenu,setCartOpen}){return <><div className="announcement">FREE SHIPPING ON ORDERS OVER ₹1,499 · PRE-LOVED, RE-LOVED</div><header className="nav"><button className="icon mobile" onClick={()=>setOpenMenu(!openMenu)}>{openMenu?<X/>:<Menu/>}</button><Link className="logo" to="/">
  <img src="/Logo.png" alt="The Fashion Lab" />
</Link><nav className={openMenu?"links open":"links"}><Link onClick={()=>setOpenMenu(false)} to="/">Home</Link><Link onClick={()=>setOpenMenu(false)} to="/shop">Shop</Link><a href="/#story">Our Story</a><a href="/#contact">Contact</a>{user?.role==="admin"&&<Link onClick={()=>setOpenMenu(false)} to="/admin">Admin</Link>}</nav><div className="actions"><label className="search"><Search size={17}/><input placeholder="Search pieces..." onKeyDown={e=>e.key==="Enter"&&(window.location.href="/shop?search="+encodeURIComponent(e.currentTarget.value))}/></label><Link className="icon" to="/account"><User/></Link><button className="icon" onClick={()=>setCartOpen(true)}><ShoppingBag/>{cart.length>0&&<b>{cart.reduce((s,i)=>s+i.qty,0)}</b>}</button></div></header></>}
function Card({p,add,wish,toggle}){return <article className="product"><Link to={"/product/"+p.id} className="photo"><img src={p.image} alt={p.name}/><button onClick={e=>{e.preventDefault();toggle(p.id)}}><Heart fill={wish.includes(p.id)?"currentColor":"none"}/></button><span>{p.stock<1?"Sold out":p.condition}</span></Link><div className="info"><div><small>{p.category} · {p.size}</small><h3>{p.name}</h3></div><strong>{money(p.price)} {p.old_price&&<del>{money(p.old_price)}</del>}</strong></div><button className="add" onClick={()=>p.stock>0&&add(p)} disabled={p.stock<1}>{p.stock<1?"SOLD OUT":"ADD TO BAG"}</button></article>}
function Home({products,...props}){return <main><section className="premium-hero">
  <img
    src="/hero-fashion.jpeg"
    alt="The Fashion Lab"
    className="premium-hero-image"
  />

  <div className="premium-hero-overlay">
    <p className="hero-eyebrow">CURATED PRE-LOVED FASHION</p>

    <h1>
      STYLE
      <br />
      DESERVES
      <br />
      A SECOND LIFE.
    </h1>

    <p className="hero-description">
      Unique pieces. Better prices. Less waste.
      Discover clothes with character and give them another story.
    </p>

    <button
      className="premium-hero-button"
      onClick={() => window.location.href = "/shop"}
    >
      SHOP THE COLLECTION
      <span>→</span>
    </button>
  </div>
</section>
function Shop({products,...props}){const [cat,setCat]=useState("All"),[q,setQ]=useState("");const list=products.filter(p=>(cat==="All"||p.category===cat)&&(`${p.name} ${p.category} ${p.gender}`).toLowerCase().includes(q.toLowerCase()));return <main className="page"><p className="eyebrow">THE CURRENT DROP</p><h1>Shop the collection.</h1><div className="shop-tools"><div className="filters">{["All","Vintage","Streetwear","Casual"].map(c=><button className={cat===c?"active":""} onClick={()=>setCat(c)} key={c}>{c}</button>)}</div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..."/></div><div className="grid">{list.map(p=><Card key={p.id} p={p} {...props}/>)}</div></main>}
function Cart({cart,setCart,close}){const nav=useNavigate(),total=cart.reduce((s,i)=>s+i.price*i.qty,0);return <div className="overlay" onClick={close}><aside className="cart" onClick={e=>e.stopPropagation()}><div className="cart-head"><h2>Your Bag</h2><button className="icon" onClick={close}><X/></button></div>{!cart.length?<div className="empty">Your bag is waiting.<br/><Link to="/shop" onClick={close}>Shop the collection</Link></div>:<><div className="cart-items">{cart.map(i=><div className="cart-item" key={i.id}><img src={i.image}/><div><strong>{i.name}</strong><span>{money(i.price)}</span><div className="qty"><button onClick={()=>setCart(c=>c.map(x=>x.id===i.id?{...x,qty:Math.max(1,x.qty-1)}:x))}>-</button>{i.qty}<button onClick={()=>setCart(c=>c.map(x=>x.id===i.id?{...x,qty:x.qty+1}:x))}>+</button><button onClick={()=>setCart(c=>c.filter(x=>x.id!==i.id))}>Remove</button></div></div></div>)}</div><div className="cart-bottom"><div><span>Subtotal</span><strong>{money(total)}</strong></div><small>Shipping calculated at checkout.</small><button className="button dark checkout" onClick={()=>{close();nav("/checkout")}}>CHECKOUT <ArrowRight size={17}/></button></div></>}</aside></div>}
function Footer(){return <footer><div><Link className="logo light" to="/">THE FASHION<span>LAB</span></Link><p>Pre-loved. Re-loved. Re-styled.</p></div><div className="footer-links"><Link to="/shop">Shop</Link><Link to="/account">Account</Link><a href="/#story">Our Story</a></div><div><Instagram/> @thefashionlab</div></footer>}
export default function App(){const [products,setProducts]=useState([]),[cart,setCart]=useState(()=>JSON.parse(localStorage.getItem("thrift_cart")||"[]")),[wish,setWish]=useState(()=>JSON.parse(localStorage.getItem("thrift_wish")||"[]")),[user,setUser]=useState(()=>JSON.parse(localStorage.getItem("thrift_user")||"null")),[cartOpen,setCartOpen]=useState(false),[openMenu,setOpenMenu]=useState(false);useEffect(()=>{api("/products").then(setProducts).catch(console.error)},[]);useEffect(()=>localStorage.setItem("thrift_cart",JSON.stringify(cart)),[cart]);useEffect(()=>localStorage.setItem("thrift_wish",JSON.stringify(wish)),[wish]);const add=p=>setCart(c=>{const x=c.find(i=>i.id===p.id);return x?c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...c,{...p,qty:1}]});const toggle=id=>setWish(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id]);return <div className="site"><Header cart={cart} user={user} openMenu={openMenu} setOpenMenu={setOpenMenu} setCartOpen={setCartOpen}/><Routes><Route path="/" element={<Home products={products} add={add} wish={wish} toggle={toggle}/>}/><Route path="/shop" element={<Shop products={products} add={add} wish={wish} toggle={toggle}/>}/><Route path="/product/:id" element={<ProductDetails products={products} add={add} wishlist={wish} toggle={toggle}/>}/><Route path="/checkout" element={<Checkout cart={cart} user={user} clearCart={()=>setCart([])}/>}/><Route path="/success" element={<Success/>}/><Route path="/account" element={<Account user={user} setUser={setUser}/>}/><Route path="/admin" element={<Admin user={user}/>}/></Routes><Footer/>{cartOpen&&<Cart cart={cart} setCart={setCart} close={()=>setCartOpen(false)}/>}</div>}
