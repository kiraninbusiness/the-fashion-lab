import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {initDb} from './db.js';
import auth from './routes/auth.js';
import products from './routes/products.js';
import orders from './routes/orders.js';
import reviews from './routes/reviews.js';

const app=express();
app.use(cors({origin:process.env.CLIENT_URL||'http://localhost:5173'}));
app.use(express.json({limit:'1mb'}));
app.get('/api/health',(req,res)=>res.json({ok:true}));
app.use('/api/auth',auth);
app.use('/api/products',products);
app.use('/api/orders',orders);
app.use('/api/reviews',reviews);

const port=process.env.PORT||5000;
initDb().then(()=>app.listen(port,()=>console.log(`API running on http://localhost:${port}`)))
.catch(e=>{console.error(e);process.exit(1)});
