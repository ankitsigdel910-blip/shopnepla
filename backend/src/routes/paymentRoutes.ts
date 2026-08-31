import { Router } from 'express';

import {
  initiateEsewa,
  esewaCallback,
  markCodCollected,
} from '../controllers/paymentController';

import {
  protect,
  authorize,
} from '../middleware/auth';

const router = Router();

/* =====================================================
   ESEWA
===================================================== */

/*
 * Initiate eSewa payment
 *
 * Private:
 * Customer must be logged in.
 */
router.post(
  '/esewa/initiate/:orderId',
  protect,
  initiateEsewa
);

/*
 * eSewa callback
 *
 * Public:
 * eSewa redirects the customer's browser
 * directly to this endpoint.
 *
 * paymentController verifies:
 * - callback signature
 * - order
 * - amount
 * - eSewa transaction status
 */
router.get(
  '/esewa/callback',
  esewaCallback
);

/* =====================================================
   CASH ON DELIVERY
===================================================== */

/*
 * Mark COD payment as collected.
 *
 * Private/Admin only.
 */
router.put(
  '/cod/:orderId/confirm',
  protect,
  authorize('admin'),
  markCodCollected
);

export default router;