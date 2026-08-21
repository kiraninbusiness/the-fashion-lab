import React,{useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {api} from "../api";
const money=n=>`₹${Number(n).toLocaleString("en-IN")}`;
export default function Checkout({cart,user,clearCart}){
 const nav=useNavigate(),[f,setF]=useState({name:user?.name||"",phone:"",address:""}),[busy,setBusy]=useState(false),[err,setErr]=useState("");
 const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
 if(!cart.length)return <main className="page empty-page"><h1>Your bag is empty.</h1><Link className="button dark" to="/shop">SHOP NOW</Link></main>;
 async function place(e){e.preventDefault();if(!user){nav("/account");return}setBusy(true);try{const d=await api("/orders/create",{method:"POST",body:JSON.stringify({items:cart.map(i=>({productId:i.id,quantity:i.qty})),shipping:f})});clearCart();nav("/success",{state:{order:d.order}})}catch(x){setErr(x.message)}finally{setBusy(false)}}
 return <main className="page"><p className="eyebrow">SECURE CHECKOUT</p><h1>Complete your order.</h1><div className="checkout-grid"><form className="form-card" onSubmit={place}><h2>Delivery details</h2><input required placeholder="Full name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/><input required placeholder="Phone number" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/><textarea required rows="5" placeholder="Full delivery address" value={f.address} onChange={e=>setF({...f,address:e.target.value})}/>{err&&<p className="error">{err}</p>}<button className="button dark full" disabled={busy}>{busy?"CREATING ORDER...":`PLACE ORDER · ${money(total)}`}</button></form><aside className="summary"><h2>Order summary</h2>{cart.map(i=><div className="summary-row" key={i.id}><span>{i.name} × {i.qty}</span><b>{money(i.price*i.qty)}</b></div>)}<hr/><div className="summary-total"><span>Total</span><b>{money(total)}</b></div></aside></div></main>
}