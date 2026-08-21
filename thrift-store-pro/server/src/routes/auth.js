import {Router} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {pool} from '../db.js';
const router=Router();
const tokenFor=u=>jwt.sign({id:u.id,email:u.email,role:u.role},process.env.JWT_SECRET,{expiresIn:'7d'});

router.post('/register',async(req,res)=>{
  try{
    const {name,email,password}=req.body;
    if(!name||!email||!password||password.length<6) return res.status(400).json({message:'Name, email and 6+ character password are required'});
    const hash=await bcrypt.hash(password,12);
    const {rows}=await pool.query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,role',[name,email.toLowerCase(),hash]);
    res.status(201).json({user:rows[0],token:tokenFor(rows[0])});
  }catch(e){res.status(400).json({message:e.code==='23505'?'Email already registered':'Registration failed'})}
});
router.post('/login',async(req,res)=>{
  const {email,password}=req.body;
  const {rows}=await pool.query('SELECT * FROM users WHERE email=$1',[email?.toLowerCase()]);
  const u=rows[0];
  if(!u||!(await bcrypt.compare(password||'',u.password_hash))) return res.status(401).json({message:'Invalid email or password'});
  res.json({user:{id:u.id,name:u.name,email:u.email,role:u.role},token:tokenFor(u)});
});
export default router;
