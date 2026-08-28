import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { pool } from '../db.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router();

/*
  CREATE ORDER
*/
router.post('/create', auth, async (req, res) => {
  const {
    items = [],
    shipping = {},
    payment_method = 'cod'
  } = req.body;

  if (!['cod', 'online'].includes(payment_method)) {
    return res.status(400).json({
      message: 'Invalid payment method'
    });
  }

  if (!items.length) {
    return res.status(400).json({
      message: 'Cart is empty'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const ids = items.map((x) => Number(x.productId));

    const { rows } = await client.query(
      `SELECT *
       FROM products
       WHERE id = ANY($1::int[])
       FOR UPDATE`,
      [ids]
    );

    const byId = Object.fromEntries(
      rows.map((p) => [p.id, p])
    );

   let subtotal = 0;

for (const item of items) {
  const productId = Number(item.productId);
  const quantity = Number(item.quantity);

  const p = byId[productId];

  if (!p) {
    throw new Error(
      `Product ${productId} not found`
    );
  }

  if (
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    throw new Error(
      `Invalid quantity for product ${productId}`
    );
  }

  if (quantity > Number(p.stock)) {
    throw new Error(
      `Only ${p.stock} available for ${p.name}`
    );
  }

  subtotal += Number(p.price) * quantity;
}

const shipping = subtotal >= 1499 ? 0 : 79;

const total = subtotal + shipping;

    const order = (
      await client.query(
        `INSERT INTO orders(
          user_id,
          total,
          shipping_name,
          shipping_phone,
          shipping_address,
          payment_method
        )
        VALUES($1,$2,$3,$4,$5,$6)
        RETURNING *`,
        [
          req.user.id,
          total,
          shipping.name || '',
          shipping.phone || '',
          shipping.address || '',
          payment_method
        ]
      )
    ).rows[0];

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      const p = byId[productId];

      await client.query(
        `INSERT INTO order_items(
          order_id,
          product_id,
          name,
          price,
          quantity
        )
        VALUES($1,$2,$3,$4,$5)`,
        [
          order.id,
          p.id,
          p.name,
          p.price,
          quantity
        ]
      );

      await client.query(
        `UPDATE products
         SET stock = stock - $1
         WHERE id = $2`,
        [quantity, p.id]
      );
    }

    /*
      RAZORPAY
    */
    if (
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET
    ) {
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });

      const rOrder = await rzp.orders.create({
        amount: total * 100,
        currency: 'INR',
        receipt: `order_${order.id}`
      });

      await client.query(
        `UPDATE orders
         SET razorpay_order_id = $1
         WHERE id = $2`,
        [rOrder.id, order.id]
      );

      order.razorpay_order_id = rOrder.id;
    }

    await client.query('COMMIT');

    res.status(201).json({
      order
    });

  } catch (e) {
    await client.query('ROLLBACK');

    console.error(
      'ORDER CREATE ERROR:',
      e.message
    );

    res.status(400).json({
      message:
        e.message ||
        'Could not create order'
    });

  } finally {
    client.release();
  }
});


/*
  CUSTOMER — MY ORDERS
  Returns orders + purchased items
*/
router.get('/mine', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         o.*,
         COALESCE(
           json_agg(
             json_build_object(
               'product_id', oi.product_id,
               'name', oi.name,
               'price', oi.price,
               'quantity', oi.quantity,
               'item_total',
                 (oi.price * oi.quantity)
             )
             ORDER BY oi.id
           ) FILTER (
             WHERE oi.id IS NOT NULL
           ),
           '[]'
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi
         ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json(rows);

  } catch (e) {
    console.error(
      'MY ORDERS ERROR:',
      e.message
    );

    res.status(500).json({
      message: 'Could not load orders'
    });
  }
});


/*
  CUSTOMER — CANCEL OWN ORDER
  AND RESTORE PRODUCT STOCK
*/
router.patch(
  '/:id/cancel',
  auth,
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        `SELECT *
         FROM orders
         WHERE id = $1
           AND user_id = $2
           AND status = 'pending'
         FOR UPDATE`,
        [
          req.params.id,
          req.user.id
        ]
      );

      if (!orderResult.rows.length) {
        await client.query('ROLLBACK');

        return res.status(400).json({
          message:
            'This order cannot be cancelled.'
        });
      }

      const order = orderResult.rows[0];

      const itemsResult = await client.query(
        `SELECT product_id, quantity
         FROM order_items
         WHERE order_id = $1`,
        [order.id]
      );

      /*
        RESTORE STOCK
      */
      for (const item of itemsResult.rows) {
        await client.query(
          `UPDATE products
           SET stock = stock + $1
           WHERE id = $2`,
          [
            Number(item.quantity),
            Number(item.product_id)
          ]
        );
      }

      /*
        CANCEL ORDER
      */
      const updatedResult = await client.query(
        `UPDATE orders
         SET status = 'cancelled'
         WHERE id = $1
         RETURNING *`,
        [order.id]
      );

      await client.query('COMMIT');

      res.json({
        message: 'Order cancelled successfully',
        order: updatedResult.rows[0]
      });

    } catch (e) {
      await client.query('ROLLBACK');

      console.error(
        'CANCEL ORDER ERROR:',
        e.message
      );

      res.status(500).json({
        message:
          'Could not cancel order'
      });

    } finally {
      client.release();
    }
  }
);


/*
  ADMIN — ALL ORDERS
  Returns:
  - Customer information
  - Shipping information
  - Payment information
  - Order status
  - Purchased products
  - Quantity
  - Product price
  - Item total
*/
router.get('/', auth, admin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         o.*,

         u.name AS customer_name,
         u.email AS customer_email,

         COALESCE(
           json_agg(
             json_build_object(
               'product_id', oi.product_id,
               'name', oi.name,
               'price', oi.price,
               'quantity', oi.quantity,
               'item_total',
                 (oi.price * oi.quantity)
             )
             ORDER BY oi.id
           ) FILTER (
             WHERE oi.id IS NOT NULL
           ),
           '[]'
         ) AS items

       FROM orders o

       LEFT JOIN users u
         ON u.id = o.user_id

       LEFT JOIN order_items oi
         ON oi.order_id = o.id

       GROUP BY
         o.id,
         u.id

       ORDER BY o.created_at DESC`
    );

    res.json(rows);

  } catch (e) {
    console.error(
      'ADMIN ORDERS ERROR:',
      e.message
    );

    res.status(500).json({
      message: 'Could not load orders'
    });
  }
});


/*
  ADMIN — SINGLE ORDER DETAILS
*/
router.get(
  '/:id',
  auth,
  admin,
  async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT
           o.*,

           u.name AS customer_name,
           u.email AS customer_email,

           COALESCE(
             json_agg(
               json_build_object(
                 'product_id', oi.product_id,
                 'name', oi.name,
                 'price', oi.price,
                 'quantity', oi.quantity,
                 'item_total',
                   (oi.price * oi.quantity)
               )
               ORDER BY oi.id
             ) FILTER (
               WHERE oi.id IS NOT NULL
             ),
             '[]'
           ) AS items

         FROM orders o

         LEFT JOIN users u
           ON u.id = o.user_id

         LEFT JOIN order_items oi
           ON oi.order_id = o.id

         WHERE o.id = $1

         GROUP BY
           o.id,
           u.id`,
        [req.params.id]
      );

      if (!rows.length) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }

      res.json(rows[0]);

    } catch (e) {
      console.error(
        'ORDER DETAILS ERROR:',
        e.message
      );

      res.status(500).json({
        message:
          'Could not load order details'
      });
    }
  }
);


/*
  ADMIN — UPDATE ORDER STATUS
*/
router.patch(
  '/:id/status',
  auth,
  admin,
  async (req, res) => {
    const {
      status,
      payment_status
    } = req.body;

    const allowedStatuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    ];

    const allowedPaymentStatuses = [
      'pending',
      'paid',
      'failed',
      'refunded'
    ];

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message: 'Invalid order status'
      });
    }

    if (
      payment_status !== undefined &&
      !allowedPaymentStatuses.includes(
        payment_status
      )
    ) {
      return res.status(400).json({
        message: 'Invalid payment status'
      });
    }

    try {
      const { rows } =
        await pool.query(
          `UPDATE orders
           SET
             status = COALESCE($1, status),
             payment_status = COALESCE($2, payment_status)
           WHERE id = $3
           RETURNING *`,
          [
            status,
            payment_status,
            req.params.id
          ]
        );

      if (!rows.length) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }

      res.json(rows[0]);

    } catch (e) {
      console.error(
        'UPDATE ORDER STATUS ERROR:',
        e.message
      );

      res.status(500).json({
        message:
          'Could not update order status'
      });
    }
  }
);


/*
  RAZORPAY PAYMENT VERIFICATION
*/
router.post(
  '/verify-payment',
  auth,
  async (req, res) => {

    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return res.status(503).json({
        message:
          'Razorpay is not configured'
      });
    }

    const expected =
      crypto
        .createHmac(
          'sha256',
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest('hex');

    if (
      expected !== razorpay_signature
    ) {
      return res.status(400).json({
        message:
          'Invalid payment signature'
      });
    }

    const { rows } =
      await pool.query(
        `UPDATE orders
         SET
           payment_status = 'paid',
           status = 'processing'
         WHERE id = $1
           AND user_id = $2
         RETURNING *`,
        [
          orderId,
          req.user.id
        ]
      );

    if (!rows.length) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.json(rows[0]);
  }
);


export default router;
