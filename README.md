# ShopNepal — Full-Stack E-Commerce Store

A complete e-commerce platform: React + TypeScript customer storefront, a separate React + TypeScript
admin dashboard, and a Node.js/Express + TypeScript API backed by MongoDB — with JWT auth, cart,
wishlist, multi-step checkout, coupons, and eSewa / Khalti / Cash-on-Delivery payments.

## What's included

- **backend/** — Express + TypeScript REST API, MongoDB/Mongoose models, JWT auth (register/login by
  email or phone/logout/forgot-reset-change password/profile), role-based authorization, product &
  category CRUD with search/filter/sort, cart & wishlist, addresses, orders with transactional stock
  deduction, coupons, eSewa & Khalti payment integration (backend-verified, never trusts the frontend),
  admin APIs (dashboard stats, users, orders, products, revenue), security middleware (CORS, mongo
  sanitize, rate limiting — including a stricter limiter on auth routes), consistent
  `{ success, message, data }` / `{ success, message, errors }` responses, and a database seed script.
- **frontend/** — Customer-facing React + TS + Vite + Tailwind app: home page, shop with search/filters/
  sort/pagination, product detail with reviews, cart, wishlist, 4-step checkout (address → summary →
  payment → confirmation) with coupon support and eSewa/Khalti/COD, user dashboard (profile, orders,
  addresses, change password), Redux Toolkit state, React Hook Form + Zod validation, toast
  notifications.
- **admin/** — Separate React + TS + Vite + Tailwind admin app: login, dashboard with stat cards and
  Recharts revenue/order charts, product management (create/edit/upload images/toggle status/delete),
  category management, order management with the pending → confirmed → processing → shipped →
  out-for-delivery → delivered workflow, user management (search/activate/deactivate/change role).

## Prerequisites

- Node.js 18+
- A MongoDB instance (local `mongod` or a free MongoDB Atlas cluster)
- (Optional, for image uploads) A free Cloudinary account
- (Optional, for real payments) eSewa and Khalti merchant/test credentials — the app runs fine without
  them using Cash on Delivery, and eSewa's `EPAYTEST` sandbox credentials work out of the box for testing

## 1. Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce-store   # or your Atlas connection string
JWT_SECRET=replace-with-a-long-random-string
```

Install and run:

```bash
npm install
npm run dev
```

The API starts on **http://localhost:5000**. Confirm it's up:

```bash
curl http://localhost:5000/api/health
```

Seed sample data (admin account, customers, categories, products, reviews, coupons):

```bash
npm run seed
```

This prints the generated admin login (email/password from `.env`, defaults to
`admin@example.com` / `ChangeMe123!`) and a sample customer login (`aarav@example.com` / `Password123`).
**Change the seed admin password before deploying anywhere real.**

## 2. Customer frontend setup

```bash
cd frontend
cp .env.example .env    # VITE_API_URL=http://localhost:5000/api by default
npm install
npm run dev
```

Runs on **http://localhost:5173**.

## 3. Admin dashboard setup

```bash
cd admin
cp .env.example .env    # VITE_API_URL=http://localhost:5000/api by default
npm install
npm run dev
```

Runs on **http://localhost:5174**. Log in with the seeded admin account.

## Running everything together

Open three terminals:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Terminal 3
cd admin && npm run dev
```

Then visit:
- Storefront: http://localhost:5173
- Admin dashboard: http://localhost:5174
- API: http://localhost:5000/api

## Payment gateway notes

- **eSewa**: uses the official `EPAYTEST` sandbox merchant code by default (`ESEWA_MERCHANT_ID` in
  `.env`). The backend builds and HMAC-signs the payment form, and independently re-verifies every
  callback against eSewa's transaction-status API before marking an order paid — a spoofed browser
  redirect can never mark an order as paid on its own.
- **Khalti**: uses the KPG-2 `epayment/initiate` + `epayment/lookup` API. Set `KHALTI_SECRET_KEY` to a
  real test/live secret key from the Khalti merchant dashboard to try it; the backend looks up the
  payment status server-side before confirming.
- **Cash on Delivery**: `paymentStatus` stays `pending` until an admin marks it collected (via the
  order-status "delivered" transition, which auto-marks COD orders paid).

## Environment variables reference

**backend/.env**
```env
NODE_ENV=development
PORT=5000
BACKEND_URL=http://localhost:5000
MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce-store
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_DAYS=7
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=
ESEWA_BASE_URL=https://rc-epay.esewa.com.np
KHALTI_SECRET_KEY=
KHALTI_BASE_URL=https://a.khalti.com/api/v2
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=ChangeMe123!
```

**frontend/.env** and **admin/.env**
```env
VITE_API_URL=http://localhost:5000/api
```

Secret keys (`JWT_SECRET`, Cloudinary, eSewa, Khalti) live only in `backend/.env` and are never sent to
either frontend.

## Project structure

```text
ecommerce-store/
├── backend/     Express + TypeScript API (models, controllers, routes, services, middleware)
├── frontend/    Customer storefront (React + TS + Vite + Tailwind + Redux Toolkit)
├── admin/       Admin dashboard (React + TS + Vite + Tailwind + Redux Toolkit + Recharts)
└── README.md
```

## Security checklist (implemented)

- [x] Passwords hashed with bcrypt (12 rounds), never returned in API responses
- [x] JWT auth via httpOnly cookie + Bearer token fallback
- [x] Role-based authorization (`protect` + `authorize('admin')`) on every admin/customer route split
- [x] Input validation (`express-validator` on auth; manual checks elsewhere) with a consistent error shape
- [x] CORS restricted to the configured frontend/admin origins
- [x] `express-mongo-sanitize` against NoSQL injection
- [x] Rate limiting (global + a stricter limiter on login/register/forgot-password)
- [x] Payments verified server-side only; frontend "success" redirects are never trusted
- [x] Stock deduction happens inside a MongoDB transaction at order creation, with restock on cancel

## Known simplifications / next steps

- Password-reset and order emails are stubbed (the reset token is returned directly in the API response
  in non-production for local testing) — wire up a provider like SendGrid/Resend for production.
- Shipping fee is a flat rate; swap `SHIPPING_FEE_FLAT` in `orderController.ts` for a real rate table
  if needed.
- Image uploads require Cloudinary credentials to actually store files; without them, product/category
  creation still works but `images`/`image` stay empty until you add credentials.
- MongoDB transactions (used for order stock deduction) require MongoDB to be running as a replica set
  (Atlas clusters are by default; a local single-node `mongod` is not — run `mongod --replSet rs0` and
  `rs.initiate()` once, or point `MONGODB_URI` at Atlas, to use checkout locally).
