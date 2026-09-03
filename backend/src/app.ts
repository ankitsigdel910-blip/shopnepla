import express, {
  Application,
} from 'express';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import path from 'path';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import cartRoutes from './routes/cartRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import addressRoutes from './routes/addressRoutes';
import orderRoutes from './routes/orderRoutes';
import couponRoutes from './routes/couponRoutes';
import paymentRoutes from './routes/paymentRoutes';
import adminRoutes from './routes/adminRoutes';

import {
  notFound,
  errorHandler,
} from './middleware/errorHandler';

/* ============================================================
   APP
============================================================ */

const app: Application =
  express();

/* ============================================================
   TRUST PROXY

   Render runs the Node/Express application behind a reverse
   proxy. This allows Express and express-rate-limit to obtain
   the correct client IP from X-Forwarded-For.
============================================================ */

if (
  process.env.NODE_ENV ===
  'production'
) {
  app.set(
    'trust proxy',
    1
  );
}

/* ============================================================
   SECURITY / CORE MIDDLEWARE
============================================================ */

app.use(
  cors({
    origin: [
      process.env
        .FRONTEND_URL ||
        'http://localhost:5173',

      process.env
        .ADMIN_URL ||
        'http://localhost:5174',
    ],

    credentials: true,
  })
);

app.use(
  express.json({
    limit: '10kb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  cookieParser()
);

app.use(
  mongoSanitize()
);

/* ============================================================
   LOCAL PRODUCT IMAGES
============================================================ */

/*
 * Example:
 *
 * backend/uploads/products/photo.webp
 *
 * becomes:
 *
 * http://localhost:5000/uploads/products/photo.webp
 */

app.use(
  '/uploads',

  express.static(
    path.resolve(
      process.cwd(),
      'uploads'
    )
  )
);

/* ============================================================
   LOGGING
============================================================ */

if (
  process.env.NODE_ENV !==
  'production'
) {
  app.use(
    morgan('dev')
  );
}

/* ============================================================
   GENERAL API RATE LIMITER
============================================================ */

const apiLimiter =
  rateLimit({
    windowMs:
      15 *
      60 *
      1000,

    limit: 300,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,

      message:
        'Too many requests, please try again later',
    },
  });

app.use(
  '/api',
  apiLimiter
);

/* ============================================================
   AUTH RATE LIMITER
============================================================ */

const authLimiter =
  rateLimit({
    windowMs:
      15 *
      60 *
      1000,

    limit: 20,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,

      message:
        'Too many attempts, please try again later',
    },
  });

app.use(
  '/api/auth/login',
  authLimiter
);

app.use(
  '/api/auth/register',
  authLimiter
);

app.use(
  '/api/auth/forgot-password',
  authLimiter
);

/* ============================================================
   HEALTH CHECK
============================================================ */

app.get(
  '/api/health',

  (_req, res) => {
    res
      .status(200)
      .json({
        success: true,

        message:
          'API is healthy',

        data: {},
      });
  }
);

/* ============================================================
   AUTH ROUTES
============================================================ */

app.use(
  '/api/auth',
  authRoutes
);

/* ============================================================
   PRODUCT ROUTES
============================================================ */

app.use(
  '/api/products',
  productRoutes
);

/* ============================================================
   CATEGORY ROUTES
============================================================ */

app.use(
  '/api/categories',
  categoryRoutes
);

/* ============================================================
   CART ROUTES
============================================================ */

app.use(
  '/api/cart',
  cartRoutes
);

/* ============================================================
   WISHLIST ROUTES
============================================================ */

app.use(
  '/api/wishlist',
  wishlistRoutes
);

/* ============================================================
   ADDRESS ROUTES
============================================================ */

app.use(
  '/api/addresses',
  addressRoutes
);

/* ============================================================
   ORDER ROUTES
============================================================ */

app.use(
  '/api/orders',
  orderRoutes
);

/* ============================================================
   COUPON ROUTES
============================================================ */

app.use(
  '/api/coupons',
  couponRoutes
);

/* ============================================================
   PAYMENT ROUTES
============================================================ */

app.use(
  '/api/payments',
  paymentRoutes
);

/* ============================================================
   ADMIN ROUTES
============================================================ */

app.use(
  '/api/admin',
  adminRoutes
);

/* ============================================================
   404 HANDLER
============================================================ */

app.use(
  notFound
);

/* ============================================================
   GLOBAL ERROR HANDLER
============================================================ */

app.use(
  errorHandler
);

/* ============================================================
   EXPORT APP
============================================================ */

export default app;