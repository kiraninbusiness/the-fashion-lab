import React,{useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {api} from "../api";

const money=n=>`₹${Number(n).toLocaleString("en-IN")}`;

export default function Account({user,setUser}){
 const [mode,setMode]=useState("login"),[f,setF]=useState({name:"",email:"",password:""}),[err,setErr]=useState(""),[orders,setOrders]=useState([]),[loading,setLoading]=useState(false);
 useEffect(()=>{if(user)api("/orders/mine").then(setOrders).catch(()=>setOrders([]))},[user]);
 if(user)return <main className="page account-page account-dashboard">
   <p className="eyebrow">MY ACCOUNT</p><h1>Welcome, {user.name}.</h1><p>{user.email}</p>
   <div className="account-actions">{user.role==="admin"&&<Link className="button dark" to="/admin">ADMIN DASHBOARD</Link>}<button className="outline" onClick={()=>{localStorage.removeItem("thrift_token");localStorage.removeItem("thrift_user");setUser(null)}}>LOG OUT</button></div>
   <section className="orders-card"><div className="orders-head"><h2>Your orders</h2><Link to="/shop">Continue shopping</Link></div>
   {!orders.length?<p className="muted">You have no orders yet.</p>:orders.map(o=><article className="order-card" key={o.id}><div><strong>Order #{o.id}</strong><span>{new Date(o.created_at).toLocaleDateString("en-IN")}</span></div><div><span className={`status status-${o.status}`}>{o.status}</span><strong>{money(o.total)}</strong></div></article>)}</section>
 </main>;
 async function submit(e){e.preventDefault();setErr("");setLoading(true);try{const d=await api("/auth/"+mode,{method:"POST",body:JSON.stringify(f)});localStorage.setItem("thrift_token",d.token);localStorage.setItem("thrift_user",JSON.stringify(d.user));setUser(d.user)}catch(e){setErr(e.message)}finally{setLoading(false)}}
 return <main className="page account-page"><p className="eyebrow">YOUR ACCOUNT</p><h1>{mode==="login"?"Welcome back.":"Join The Fashion LAB."}</h1>
 <form className="account-form" onSubmit={submit}>{mode==="register"&&<input required placeholder="Full name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>}<input required type="email" placeholder="Email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/><input required minLength="6" type="password" placeholder="Password" value={f.password} onChange={e=>setF({...f,password:e.target.value})}/>{err&&<p className="error">{err}</p>}<button disabled={loading} className="button dark">{loading?"PLEASE WAIT...":mode==="login"?"LOGIN":"CREATE ACCOUNT"}</button></form><button className="switch" onClick={()=>{setErr("");setMode(mode==="login"?"register":"login")}}>{mode==="login"?"Create an account":"Already registered? Login"}</button></main>
}
