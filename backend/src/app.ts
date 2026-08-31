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

const app: Application =
  express();

// ============================================================
// SECURITY / CORE MIDDLEWARE
// ============================================================

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

// ============================================================
// LOCAL PRODUCT IMAGES
// ============================================================

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

// ============================================================
// LOGGING
// ============================================================

if (
  process.env.NODE_ENV !==
  'production'
) {
  app.use(
    morgan('dev')
  );
}

// ============================================================
// RATE LIMITER
// ============================================================

const apiLimiter =
  rateLimit({
    windowMs:
      15 *
      60 *
      1000,

    limit: 300,

    standardHeaders: true,

    legacyHeaders: false,
  });

app.use(
  '/api',
  apiLimiter
);

// ============================================================
// AUTH RATE LIMITER
// ============================================================

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

// ============================================================
// HEALTH CHECK
// ============================================================

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

// ============================================================
// ROUTES
// ============================================================

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/products',
  productRoutes
);

app.use(
  '/api/categories',
  categoryRoutes
);

app.use(
  '/api/cart',
  cartRoutes
);

app.use(
  '/api/wishlist',
  wishlistRoutes
);

app.use(
  '/api/addresses',
  addressRoutes
);

app.use(
  '/api/orders',
  orderRoutes
);

app.use(
  '/api/coupons',
  couponRoutes
);

app.use(
  '/api/payments',
  paymentRoutes
);

app.use(
  '/api/admin',
  adminRoutes
);

// ============================================================
// ERROR HANDLING
// ============================================================

app.use(notFound);

app.use(errorHandler);

export default app;