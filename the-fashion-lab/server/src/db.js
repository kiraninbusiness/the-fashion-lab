import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function initDb(){
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products(
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT NOT NULL,
      gender TEXT DEFAULT 'Unisex',
      size TEXT NOT NULL,
      condition TEXT DEFAULT 'Excellent',
      price INTEGER NOT NULL,
      old_price INTEGER,
      image TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders(
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'pending',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT NOT NULL DEFAULT 'cod',
      razorpay_order_id TEXT,
      total INTEGER NOT NULL,
      shipping_name TEXT,
      shipping_phone TEXT,
      shipping_address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS order_items(
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL
    );
  `);
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cod'");
  if(process.env.ADMIN_EMAIL){ await pool.query("UPDATE users SET role='admin' WHERE email=$1",[process.env.ADMIN_EMAIL.toLowerCase()]); }
  const {rows}=await pool.query('SELECT COUNT(*)::int AS count FROM products');
  if(rows[0].count===0){
    await pool.query(`INSERT INTO products
      (name,description,category,gender,size,condition,price,old_price,image,stock)
      VALUES
      ('Vintage Denim Jacket','Classic pre-loved denim jacket.','Vintage','Unisex','M','Excellent',899,1499,'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=85',1),
      ('Oversized Graphic Tee','Relaxed graphic tee for everyday streetwear.','Streetwear','Unisex','L','Very Good',499,899,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',1),
      ('Classic Linen Shirt','Lightweight linen shirt.','Casual','Men','M','Excellent',699,1199,'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85',1),
      ('Minimal Black Dress','Timeless pre-loved black dress.','Vintage','Women','S','Excellent',999,1799,'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=85',1)
    `);
  }
}
if(process.argv[1]?.endsWith('src/db.js')) initDb().then(()=>{console.log('Database ready');process.exit()}).catch(e=>{console.error(e);process.exit(1)});
