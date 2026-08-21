import React from "react";
import {Link,useParams} from "react-router-dom";
import {ArrowLeft,Heart,ShoppingBag} from "lucide-react";
export default function ProductDetails({products,add,wishlist,toggle}){
 const {id}=useParams(),p=products.find(x=>String(x.id)===id);
 if(!p)return <main className="page"><h1>Piece not found.</h1><Link to="/shop">Back to shop</Link></main>;
 return <main className="page"><Link className="back" to="/shop"><ArrowLeft size={15}/> Back to shop</Link><div className="detail-grid"><div className="detail-image"><img src={p.image} alt={p.name}/></div><div className="detail-copy"><p className="eyebrow">{p.category} · {p.condition}</p><h1>{p.name}</h1><div className="detail-price">₹{Number(p.price).toLocaleString("en-IN")} {p.old_price&&<del>₹{Number(p.old_price).toLocaleString("en-IN")}</del>}</div><p>{p.description||"A carefully selected pre-loved piece, ready for its next story."}</p><div className="specs"><span>Size<b>{p.size}</b></span><span>Gender<b>{p.gender}</b></span><span>Condition<b>{p.condition}</b></span></div><div className="detail-actions"><button className="button dark" onClick={()=>add(p)}><ShoppingBag size={16}/> ADD TO BAG</button><button className="outline" onClick={()=>toggle(p.id)}><Heart fill={wishlist.includes(p.id)?"currentColor":"none"}/> SAVE</button></div></div></div></main>
}