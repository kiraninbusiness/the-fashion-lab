import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../db.js';

const router = Router();

const tokenFor = (u) =>
  jwt.sign(
    {
      id: u.id,
      email: u.email,
      role: u.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );


// =====================================================
// REGISTER
// =====================================================

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      password.length < 6
    ) {
      return res.status(400).json({
        message:
          'Name, email and 6+ character password are required'
      });
    }

    const hash = await bcrypt.hash(password, 12);

    const { rows } = await pool.query(
      `INSERT INTO users
        (name, email, password_hash)
       VALUES
        ($1, $2, $3)
       RETURNING id, name, email, role`,
      [
        name,
        email.toLowerCase(),
        hash
      ]
    );

    res.status(201).json({
      user: rows[0],
      token: tokenFor(rows[0])
    });

  } catch (e) {

    res.status(400).json({
      message:
        e.code === '23505'
          ? 'Email already registered'
          : 'Registration failed'
    });

  }
});


// =====================================================
// LOGIN
// =====================================================

router.post('/login', async (req, res) => {

  try {

    const { email, password } = req.body;

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email=$1',
      [
        email?.toLowerCase()
      ]
    );

    const u = rows[0];

    if (
      !u ||
      !(await bcrypt.compare(
        password || '',
        u.password_hash
      ))
    ) {

      return res.status(401).json({
        message: 'Invalid email or password'
      });

    }

    res.json({
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role
      },
      token: tokenFor(u)
    });

  } catch (e) {

    console.error(e);

    res.status(500).json({
      message: 'Login failed'
    });

  }

});


// =====================================================
// FORGOT PASSWORD
// =====================================================

router.post('/forgot-password', async (req, res) => {

  try {

    const email = req.body.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    const { rows } = await pool.query(
      'SELECT id, name, email FROM users WHERE email=$1',
      [email]
    );

    const user = rows[0];

    /*
      We return the same message even when the email
      does not exist. This prevents people from
      discovering which emails have accounts.
    */

    if (!user) {

      return res.json({
        message:
          'If an account exists with this email, a password reset link has been sent.'
      });

    }

    // Generate secure random token
    const resetToken =
      crypto.randomBytes(32).toString('hex');

    // Token expires in 30 minutes
    const expires =
      new Date(Date.now() + 30 * 60 * 1000);

    await pool.query(
      `UPDATE users
       SET reset_token=$1,
           reset_token_expires=$2
       WHERE id=$3`,
      [
        resetToken,
        expires,
        user.id
      ]
    );

    /*
      Your frontend URL.
      Example:
      https://thrift-store-neon.vercel.app
    */

    const frontendUrl =
      process.env.FRONTEND_URL ||
      'http://localhost:5173';

    const resetLink =
      `${frontendUrl}/reset-password?token=${resetToken}`;

    console.log('=================================');
    console.log('PASSWORD RESET LINK');
    console.log(resetLink);
    console.log('=================================');


    /*
      EMAIL SENDING

      We will connect your email service in the
      next step.

      For now the reset link is printed in the
      server logs so we can test the complete
      password-reset system first.
    */

    res.json({
      message:
        'If an account exists with this email, a password reset link has been sent.'
    });

  } catch (e) {

    console.error(e);

    res.status(500).json({
      message:
        'Could not process password reset request'
    });

  }

});


// =====================================================
// RESET PASSWORD
// =====================================================

router.post('/reset-password', async (req, res) => {

  try {

    const {
      token,
      password
    } = req.body;

    if (!token || !password) {

      return res.status(400).json({
        message:
          'Reset token and new password are required'
      });

    }

    if (password.length < 6) {

      return res.status(400).json({
        message:
          'Password must be at least 6 characters'
      });

    }

    const { rows } = await pool.query(
      `SELECT *
       FROM users
       WHERE reset_token=$1
       AND reset_token_expires > NOW()`,
      [token]
    );

    const user = rows[0];

    if (!user) {

      return res.status(400).json({
        message:
          'This password reset link is invalid or has expired'
      });

    }

    const hash =
      await bcrypt.hash(password, 12);

    await pool.query(
      `UPDATE users
       SET password_hash=$1,
           reset_token=NULL,
           reset_token_expires=NULL
       WHERE id=$2`,
      [
        hash,
        user.id
      ]
    );

    res.json({
      message:
        'Password changed successfully. You can now login.'
    });

  } catch (e) {

    console.error(e);

    res.status(500).json({
      message:
        'Could not reset password'
    });

  }

});


export default router;
