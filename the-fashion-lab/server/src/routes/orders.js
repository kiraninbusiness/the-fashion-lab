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

  /*
    ONLINE PAYMENT REQUIRES RAZORPAY
  */
  if (
    payment_method === 'online' &&
    (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    )
  ) {
    return res.status(503).json({
      message:
        'Online payment is currently unavailable. Please choose Cash on Delivery.'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    /*
      GET PRODUCTS AND LOCK THEIR ROWS
      This prevents stock problems when multiple
      customers try to buy the same product.
    */
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

    /*
      CALCULATE SUBTOTAL
    */
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

      subtotal +=
        Number(p.price) * quantity;
    }

    /*
      SHIPPING
      Free above ₹1,499
      Otherwise ₹79
    */
    const shippingCharge =
      subtotal >= 1499 ? 0 : 79;

    const total =
      subtotal + shippingCharge;


    /*
      CREATE DATABASE ORDER
    */
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


    /*
      CREATE ORDER ITEMS
      AND RESERVE STOCK
    */
    for (const item of items) {
      const productId =
        Number(item.productId);

      const quantity =
        Number(item.quantity);

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

      /*
        Reserve stock immediately.

        If online payment is cancelled or fails,
        the stock will be restored by the
        payment-cancel endpoint below.
      */
      await client.query(
        `UPDATE products
         SET stock = stock - $1
         WHERE id = $2`,
        [
          quantity,
          p.id
        ]
      );
    }


    /*
      RAZORPAY ORDER
    */
    if (payment_method === 'online') {

      const rzp = new Razorpay({
        key_id:
          process.env.RAZORPAY_KEY_ID,

        key_secret:
          process.env.RAZORPAY_KEY_SECRET
      });

      const rOrder =
        await rzp.orders.create({
          amount:
            Math.round(total * 100),

          currency: 'INR',

          receipt:
            `order_${order.id}`
        });


      await client.query(
        `UPDATE orders
         SET razorpay_order_id = $1
         WHERE id = $2`,
        [
          rOrder.id,
          order.id
        ]
      );

      order.razorpay_order_id =
        rOrder.id;
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
*/
router.get('/mine', auth, async (req, res) => {

  const { rows } =
    await pool.query(
      `SELECT *
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

  res.json(rows);
});


/*
  CUSTOMER — CANCEL OWN ORDER
  AND RESTORE PRODUCT STOCK

  This is for normal pending COD orders.
*/
router.patch(
  '/:id/cancel',
  auth,
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      await client.query('BEGIN');


      const orderResult =
        await client.query(
          `SELECT *
           FROM orders
           WHERE id = $1
             AND user_id = $2
             AND status = 'pending'
             AND payment_method = 'cod'
           FOR UPDATE`,
          [
            req.params.id,
            req.user.id
          ]
        );


      if (!orderResult.rows.length) {

        await client.query(
          'ROLLBACK'
        );

        return res.status(400).json({
          message:
            'This order cannot be cancelled.'
        });
      }


      const order =
        orderResult.rows[0];


      const itemsResult =
        await client.query(
          `SELECT
             product_id,
             quantity
           FROM order_items
           WHERE order_id = $1`,
          [order.id]
        );


      /*
        RESTORE STOCK
      */
      for (
        const item
        of itemsResult.rows
      ) {

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
      const updatedResult =
        await client.query(
          `UPDATE orders
           SET status = 'cancelled'
           WHERE id = $1
           RETURNING *`,
          [order.id]
        );


      await client.query(
        'COMMIT'
      );


      res.json({
        message:
          'Order cancelled successfully',

        order:
          updatedResult.rows[0]
      });

    } catch (e) {

      await client.query(
        'ROLLBACK'
      );

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
  ONLINE PAYMENT — CANCEL / FAILED
  RESTORE PRODUCT STOCK

  This endpoint is intentionally separate
  from the normal customer cancellation route.

  It can only cancel:
  - the customer's own order
  - online payment orders
  - unpaid orders
  - orders that are not already cancelled

  Because the row is locked inside a transaction,
  calling this endpoint twice will NOT restore
  the stock twice.
*/
router.patch(
  '/:id/payment-cancel',
  auth,
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      await client.query(
        'BEGIN'
      );


      const orderResult =
        await client.query(
          `SELECT *
           FROM orders
           WHERE id = $1
             AND user_id = $2
             AND payment_method = 'online'
             AND payment_status <> 'paid'
             AND status <> 'cancelled'
           FOR UPDATE`,
          [
            req.params.id,
            req.user.id
          ]
        );


      /*
        If no order was found, it may already
        have been cancelled.

        This also prevents double stock restoration.
      */
      if (!orderResult.rows.length) {

        await client.query(
          'ROLLBACK'
        );

        return res.json({
          message:
            'Order already cancelled or payment completed.'
        });
      }


      const order =
        orderResult.rows[0];


      /*
        GET ORDER ITEMS
      */
      const itemsResult =
        await client.query(
          `SELECT
             product_id,
             quantity
           FROM order_items
           WHERE order_id = $1`,
          [order.id]
        );


      /*
        RESTORE STOCK
      */
      for (
        const item
        of itemsResult.rows
      ) {

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
      const updatedResult =
        await client.query(
          `UPDATE orders
           SET status = 'cancelled'
           WHERE id = $1
           RETURNING *`,
          [order.id]
        );


      await client.query(
        'COMMIT'
      );


      res.json({
        message:
          'Unpaid order cancelled successfully',

        order:
          updatedResult.rows[0]
      });

    } catch (e) {

      await client.query(
        'ROLLBACK'
      );

      console.error(
        'PAYMENT CANCEL ERROR:',
        e.message
      );

      res.status(500).json({
        message:
          'Could not cancel unpaid order'
      });

    } finally {
      client.release();
    }
  }
);


/*
  ADMIN — ALL ORDERS
*/
router.get(
  '/',
  auth,
  admin,
  async (req, res) => {

    const { rows } =
      await pool.query(
        `SELECT
           o.*,
           u.name,
           u.email
         FROM orders o
         JOIN users u
           ON u.id = o.user_id
         ORDER BY o.created_at DESC`
      );

    res.json(rows);
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


    const { rows } =
      await pool.query(
        `UPDATE orders
         SET
           status =
             COALESCE($1, status),

           payment_status =
             COALESCE(
               $2,
               payment_status
             )

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
        message:
          'Order not found'
      });
    }


    res.json(
      rows[0]
    );
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


    /*
      Get the customer's order
    */
    const orderResult =
      await pool.query(
        `SELECT *
         FROM orders
         WHERE id = $1
           AND user_id = $2`,
        [
          orderId,
          req.user.id
        ]
      );


    if (!orderResult.rows.length) {
      return res.status(404).json({
        message:
          'Order not found'
      });
    }


    const order =
      orderResult.rows[0];


    /*
      Make sure the Razorpay order matches
      our database order.
    */
    if (
      order.razorpay_order_id !==
      razorpay_order_id
    ) {
      return res.status(400).json({
        message:
          'Razorpay order mismatch'
      });
    }


    /*
      If payment was already verified,
      simply return the order.
    */
    if (
      order.payment_status === 'paid'
    ) {
      return res.json(
        order
      );
    }


    /*
      CREATE EXPECTED SIGNATURE
    */
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


    /*
      VERIFY SIGNATURE
    */
    if (
      expected !==
      razorpay_signature
    ) {

      return res.status(400).json({
        message:
          'Invalid payment signature'
      });
    }


    /*
      MARK PAYMENT AS PAID
    */
    const { rows } =
      await pool.query(
        `UPDATE orders
         SET
           payment_status = 'paid',
           status = 'processing'
         WHERE id = $1
           AND user_id = $2
           AND payment_status <> 'paid'
         RETURNING *`,
        [
          orderId,
          req.user.id
        ]
      );


    if (!rows.length) {

      const latest =
        await pool.query(
          `SELECT *
           FROM orders
           WHERE id = $1`,
          [orderId]
        );

      return res.json(
        latest.rows[0]
      );
    }


    res.json(
      rows[0]
    );
  }
);


export default router;
