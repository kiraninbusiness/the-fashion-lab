# THE FASHION LAB — Full-stack starter

A production-oriented starter for a thrift-fashion store:
- React + Vite frontend
- Node.js + Express API
- PostgreSQL-ready data model
- JWT authentication
- Cart, wishlist, orders
- Admin product/inventory endpoints
- Razorpay payment order endpoint (requires your own keys)

## 1. Requirements
- Node.js 18+
- PostgreSQL 14+
- A Razorpay account for payments

## 2. Configure server
Copy `server/.env.example` to `server/.env` and fill in your database/JWT values.
Razorpay keys are optional for local browsing; checkout payment creation requires them.

## 3. Install
From the project root:
```bash
cd server && npm install
cd ../client && npm install
```

## 4. Database
Create a PostgreSQL database, then run:
```bash
cd server
npm run db:init
```

## 5. Run
Terminal 1:
```bash
cd server
npm run dev
```
Terminal 2:
```bash
cd client
npm run dev
```

The frontend uses `http://localhost:5000/api` by default.

## 6. Admin
Register normally, then set the user's `role` to `admin` in PostgreSQL:
```sql
UPDATE users SET role='admin' WHERE email='your-email@example.com';
```

## 7. Razorpay
Set:
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET

The server creates a Razorpay order and returns the order details. For production, add webhook signature verification and persist payment verification before marking orders as paid.

## Production checklist
Use HTTPS, secure cookies or short-lived access tokens, rate limiting, validation, image storage/CDN, email/SMS notifications, Razorpay webhooks, database migrations, backups, logging and monitoring.
