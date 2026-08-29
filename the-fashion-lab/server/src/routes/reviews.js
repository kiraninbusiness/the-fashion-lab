import { Router } from 'express';
import { pool } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// GET all reviews for a product, newest first, plus a rating summary
router.get('/:productId', async (req, res) => {
  const { productId } = req.params;

  const { rows } = await pool.query(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC`,
    [productId]
  );

  const count = rows.length;
  const average = count
    ? rows.reduce((sum, r) => sum + r.rating, 0) / count
    : 0;

  res.json({
    reviews: rows,
    summary: {
      count,
      average: Math.round(average * 10) / 10
    }
  });
});

// POST a review — one per user per product. Editing re-submits (upsert).
router.post('/:productId', auth, async (req, res) => {
  const { productId } = req.params;
  const { rating, comment = '' } = req.body;

  const ratingNum = Number(rating);

  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const { rows } = await pool.query(
    `INSERT INTO reviews (product_id, user_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (product_id, user_id)
     DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = NOW()
     RETURNING id, rating, comment, created_at`,
    [productId, req.user.id, ratingNum, comment.slice(0, 1000)]
  );

  res.status(201).json({
    ...rows[0],
    user_name: req.user.name || 'You'
  });
});

export default router;
