import {
  Router,
} from 'express';

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  createReview,
} from '../controllers/productController';

import {
  protect,
  authorize,
} from '../middleware/auth';

import upload from '../middleware/upload';

const router =
  Router();

// ============================================================
// PUBLIC PRODUCT ROUTES
// ============================================================

router.get(
  '/',
  getProducts
);

router.get(
  '/:id',
  getProduct
);

// ============================================================
// ADMIN PRODUCT ROUTES
// ============================================================

router.post(
  '/',

  protect,

  authorize('admin'),

  upload.array(
    'images',
    8
  ),

  createProduct
);

router.put(
  '/:id',

  protect,

  authorize('admin'),

  upload.array(
    'images',
    8
  ),

  updateProduct
);

router.delete(
  '/:id',

  protect,

  authorize('admin'),

  deleteProduct
);

router.put(
  '/:id/toggle-status',

  protect,

  authorize('admin'),

  toggleProductStatus
);

// ============================================================
// REVIEWS
// ============================================================

router.post(
  '/:id/reviews',

  protect,

  createReview
);

export default router;