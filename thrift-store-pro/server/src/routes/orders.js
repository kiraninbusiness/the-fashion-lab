import {Router} from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import {pool} from '../db.js';
import {auth,admin} from '../middleware/auth.js';
const router=Router();

router.post('/create',auth,async(req,res)=>{
  const {items=[],shipping={}}=req.body;
  if(!items.length)return res.status(400).json({message:'Cart is empty'});
  const ids=items.map(x=>x.productId);
  const {rows}=await pool.query('SELECT * FROM products WHERE id=ANY($1::int[])',[ids]);
  const byId=Object.fromEntries(rows.map(p=>[p.id,p]));
  let total=0;
  for(const item of items){
    const p=byId[item.productId];
    if(!p||p.stock<item.quantity)return res.status(400).json({message:`Unavailable quantity for product ${item.productId}`});
    total+=p.price*item.quantity;
  }
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const order=(await client.query(`INSERT INTO orders(user_id,total,shipping_name,shipping_phone,shipping_address)
      VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id,total,shipping.name||'',shipping.phone||'',shipping.address||''])).rows[0];
    for(const item of items){
      const p=byId[item.productId];
      await client.query('INSERT INTO order_items(order_id,product_id,name,price,quantity) VALUES($1,$2,$3,$4,$5)',
        [order.id,p.id,p.name,p.price,item.quantity]);
      await client.query('UPDATE products SET stock=stock-$1 WHERE id=$2',[item.quantity,p.id]);
    }
    if(process.env.RAZORPAY_KEY_ID&&process.env.RAZORPAY_KEY_SECRET){
      const rzp=new Razorpay({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET});
      const rOrder=await rzp.orders.create({amount:total*100,currency:'INR',receipt:`order_${order.id}`});
      await client.query('UPDATE orders SET razorpay_order_id=$1 WHERE id=$2',[rOrder.id,order.id]);
      order.razorpay_order_id=rOrder.id;
    }
    await client.query('COMMIT');
    res.status(201).json({order});
  }catch(e){await client.query('ROLLBACK');res.status(500).json({message:'Could not create order'})}finally{client.release()}
});

router.get('/mine',auth,async(req,res)=>{
  const {rows}=await pool.query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC',[req.user.id]);res.json(rows);
});
router.get('/',auth,admin,async(req,res)=>{
  const {rows}=await pool.query('SELECT o.*,u.name,u.email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC');res.json(rows);
});
router.patch('/:id/status',auth,admin,async(req,res)=>{
  const {status,payment_status}=req.body;
  const {rows}=await pool.query('UPDATE orders SET status=COALESCE($1,status),payment_status=COALESCE($2,payment_status) WHERE id=$3 RETURNING *',[status,payment_status,req.params.id]);
  res.json(rows[0]);
});
export default router;

router.post('/verify-payment',auth,async(req,res)=>{
 const {orderId,razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;
 if(!process.env.RAZORPAY_KEY_SECRET)return res.status(503).json({message:'Razorpay is not configured'});
 const expected=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
 if(expected!==razorpay_signature)return res.status(400).json({message:'Invalid payment signature'});
 const {rows}=await pool.query("UPDATE orders SET payment_status='paid',status='processing' WHERE id=$1 AND user_id=$2 RETURNING *",[orderId,req.user.id]);
 res.json(rows[0]);
});
