import {Router} from 'express';
import {pool} from '../db.js';
import {auth,admin} from '../middleware/auth.js';
const router=Router();
router.get('/',async(req,res)=>{
  const {category,search}=req.query;
  const values=[]; const where=[];
  if(category&&category!=='All'){values.push(category);where.push(`category=$${values.length}`)}
  if(search){values.push(`%${search}%`);where.push(`(name ILIKE $${values.length} OR category ILIKE $${values.length})`)}
  const q=`SELECT * FROM products ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY created_at DESC`;
  const {rows}=await pool.query(q,values);res.json(rows);
});
router.post('/',auth,admin,async(req,res)=>{
  const {name,description='',category,gender='Unisex',size,condition='Excellent',price,old_price=null,image,images=[],stock=1}=req.body;
  const {rows}=await pool.query(`INSERT INTO products(name,description,category,gender,size,condition,price,old_price,image,images,stock)
  VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
  [name,description,category,gender,size,condition,price,old_price,image,images,stock]);
  res.status(201).json(rows[0]);
});
router.patch('/:id',auth,admin,async(req,res)=>{
  const allowed=['name','description','category','gender','size','condition','price','old_price','image','images','stock'];
  const entries=Object.entries(req.body).filter(([k])=>allowed.includes(k));
  if(!entries.length)return res.status(400).json({message:'Nothing to update'});
  const vals=entries.map(([,v])=>v); vals.push(req.params.id);
  const set=entries.map(([k],i)=>`${k}=$${i+1}`).join(',');
  const {rows}=await pool.query(`UPDATE products SET ${set} WHERE id=$${vals.length} RETURNING *`,vals);
  res.json(rows[0]);
});
router.delete('/:id',auth,admin,async(req,res)=>{await pool.query('DELETE FROM products WHERE id=$1',[req.params.id]);res.status(204).end()});
export default router;
