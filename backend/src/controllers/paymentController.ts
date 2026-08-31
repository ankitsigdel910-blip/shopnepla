import asyncHandler from 'express-async-handler';
import { Response } from 'express';

import Order from '../models/Order';

import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';

import {
  buildEsewaFormFields,
  decodeEsewaCallback,
  verifyEsewaTransaction,
} from '../services/esewaService';

/* =====================================================
   CONFIGURATION
===================================================== */

const BACKEND_URL =
  process.env.BACKEND_URL ||
  `http://localhost:${process.env.PORT || 5000}`;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  'http://localhost:5173';

/* =====================================================
   ESEWA - INITIATE
===================================================== */

// @route  POST /api/payments/esewa/initiate/:orderId
// @access Private / Order owner
export const initiateEsewa = asyncHandler(
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const order = await Order.findById(
      req.params.orderId
    );

    if (!order) {
      throw new ApiError(
        404,
        'Order not found'
      );
    }

    // Only the owner can pay this order.
    if (
      order.user.toString() !==
      req.user!.id
    ) {
      throw new ApiError(
        403,
        'Not your order'
      );
    }

    // Must be an eSewa order.
    if (
      order.paymentMethod !==
      'esewa'
    ) {
      throw new ApiError(
        400,
        'This order is not set up for eSewa'
      );
    }

    // Prevent duplicate payment.
    if (
      order.paymentStatus ===
      'paid'
    ) {
      throw new ApiError(
        400,
        'Order is already paid'
      );
    }

    // Never pay cancelled orders.
    if (
      order.orderStatus ===
      'cancelled'
    ) {
      throw new ApiError(
        400,
        'Cancelled orders cannot be paid'
      );
    }

    const {
      formUrl,
      fields,
    } = buildEsewaFormFields({
      amount:
        order.totalAmount,

      transactionUuid:
        order._id.toString(),

      successUrl:
        `${BACKEND_URL}/api/payments/esewa/callback`,

      failureUrl:
        `${FRONTEND_URL}/checkout/payment-failed?orderId=${order._id}`,
    });

    sendSuccess(
      res,
      200,
      'eSewa payment initiated',
      {
        formUrl,
        fields,
      }
    );
  }
);

/* =====================================================
   ESEWA - CALLBACK
===================================================== */

// @route GET /api/payments/esewa/callback?data=<base64>
// @access Public
//
// Flow:
//
// eSewa payment succeeds
//          ↓
// callback received
//          ↓
// signature verified
//          ↓
// amount verified
//          ↓
// eSewa status API verified
//          ↓
// paymentStatus = paid
// orderStatus   = confirmed
//          ↓
// dashboard revenue automatically increases

export const esewaCallback = asyncHandler(
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const {
      data,
    } = req.query as {
      data?: string;
    };

    // -------------------------------------------------------
    // Missing callback data
    // -------------------------------------------------------

    if (!data) {
      res.redirect(
        `${FRONTEND_URL}/checkout/payment-failed`
      );

      return;
    }

    let decoded: any;
    let isValid = false;

    // -------------------------------------------------------
    // Decode and validate callback signature
    // -------------------------------------------------------

    try {
      const callback =
        decodeEsewaCallback(
          data
        );

      decoded =
        callback.decoded;

      isValid =
        callback.isValid;
    } catch (error) {
      console.error(
        'Invalid eSewa callback:',
        error
      );

      res.redirect(
        `${FRONTEND_URL}/checkout/payment-failed`
      );

      return;
    }

    // -------------------------------------------------------
    // Invalid callback
    // -------------------------------------------------------

    if (
      !isValid ||
      !decoded?.transaction_uuid
    ) {
      const orderId =
        decoded?.transaction_uuid;

      res.redirect(
        orderId
          ? `${FRONTEND_URL}/checkout/payment-failed?orderId=${encodeURIComponent(
              orderId
            )}`
          : `${FRONTEND_URL}/checkout/payment-failed`
      );

      return;
    }

    // -------------------------------------------------------
    // Find our order
    // -------------------------------------------------------

    const order =
      await Order.findById(
        decoded.transaction_uuid
      );

    if (!order) {
      res.redirect(
        `${FRONTEND_URL}/checkout/payment-failed`
      );

      return;
    }

    // -------------------------------------------------------
    // Verify payment method
    // -------------------------------------------------------

    if (
      order.paymentMethod !==
      'esewa'
    ) {
      console.error(
        `eSewa callback received for non-eSewa order ${order._id}`
      );

      res.redirect(
        `${FRONTEND_URL}/checkout/payment-failed?orderId=${order._id}`
      );

      return;
    }

    // -------------------------------------------------------
    // Already paid
    //
    // Callbacks can happen more than once.
    // -------------------------------------------------------

    if (
      order.paymentStatus ===
      'paid'
    ) {
      res.redirect(
        `${FRONTEND_URL}/checkout/confirmation?orderId=${order._id}`
      );

      return;
    }

    // -------------------------------------------------------
    // Cancelled orders cannot be paid
    // -------------------------------------------------------

    if (
      order.orderStatus ===
      'cancelled'
    ) {
      res.redirect(
        `${FRONTEND_URL}/checkout/payment-failed?orderId=${order._id}`
      );

      return;
    }

    // -------------------------------------------------------
    // Verify amount
    // -------------------------------------------------------

    const callbackAmount =
      Number(
        decoded.total_amount
      );

    const expectedAmount =
      Number(
        order.totalAmount
      );

    if (
      !Number.isFinite(
        callbackAmount
      ) ||
      Math.abs(
        callbackAmount -
          expectedAmount
      ) > 0.01
    ) {
      console.error(
        `eSewa amount mismatch for order ${order._id}. Expected ${expectedAmount}, received ${callbackAmount}`
      );

      order.paymentStatus =
        'failed';

      await order.save();

      res.redirect(
        `${FRONTEND_URL}/checkout/payment-failed?orderId=${order._id}`
      );

      return;
    }

    // -------------------------------------------------------
    // Server-to-server verification with eSewa
    // -------------------------------------------------------

    let verified = false;

    try {
      verified =
        await verifyEsewaTransaction(
          order._id.toString(),
          order.totalAmount
        );
    } catch (error) {
      console.error(
        `eSewa verification request failed for order ${order._id}:`,
        error
      );

      res.redirect(
        `${FRONTEND_URL}/checkout/payment-failed?orderId=${order._id}`
      );

      return;
    }

    // -------------------------------------------------------
    // VERIFIED ESEWA PAYMENT
    // -------------------------------------------------------

    if (verified) {
      /*
       * This is the important field for
       * dashboard revenue.
       *
       * getDashboardStats checks:
       *
       * paymentStatus: 'paid'
       */

      order.paymentStatus =
        'paid';

      /*
       * Payment succeeded, so the order
       * can automatically become confirmed.
       */

      order.orderStatus =
        'confirmed';

      order.transactionId =
        decoded.transaction_code ||
        decoded.transaction_uuid;

      await order.save();

      console.log(
        `eSewa payment verified for order ${order._id}`
      );

      console.log(
        `Amount: Rs. ${order.totalAmount}`
      );

      console.log(
        'Payment status: paid'
      );

      console.log(
        'Order status: confirmed'
      );

      res.redirect(
        `${FRONTEND_URL}/checkout/confirmation?orderId=${order._id}`
      );

      return;
    }

    // -------------------------------------------------------
    // Verification failed
    // -------------------------------------------------------

    order.paymentStatus =
      'failed';

    await order.save();

    console.error(
      `eSewa transaction verification failed for order ${order._id}`
    );

    res.redirect(
      `${FRONTEND_URL}/checkout/payment-failed?orderId=${order._id}`
    );
  }
);

/* =====================================================
   CASH ON DELIVERY - COLLECTED
===================================================== */

// @route  PUT /api/payments/cod/:orderId/confirm
// @access Private / Admin
//
// COD flow:
//
// pending
//    ↓
// confirmed
//    ↓
// processing
//    ↓
// shipped
//    ↓
// out_for_delivery
//    ↓
// delivered
//    ↓
// paymentStatus = paid
//    ↓
// revenue increases

export const markCodCollected = asyncHandler(
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const order =
      await Order.findById(
        req.params.orderId
      );

    if (!order) {
      throw new ApiError(
        404,
        'Order not found'
      );
    }

    // -------------------------------------------------------
    // Must be COD
    // -------------------------------------------------------

    if (
      order.paymentMethod !==
      'cod'
    ) {
      throw new ApiError(
        400,
        'This order is not Cash on Delivery'
      );
    }

    // -------------------------------------------------------
    // Cancelled orders cannot collect payment
    // -------------------------------------------------------

    if (
      order.orderStatus ===
      'cancelled'
    ) {
      throw new ApiError(
        400,
        'Cannot collect payment for a cancelled order'
      );
    }

    // -------------------------------------------------------
    // Already paid
    // -------------------------------------------------------

    if (
      order.paymentStatus ===
      'paid'
    ) {
      sendSuccess(
        res,
        200,
        'COD payment is already marked as collected',
        {
          order,
        }
      );

      return;
    }

    // -------------------------------------------------------
    // IMPORTANT:
    // COD money should only be collected after delivery.
    // -------------------------------------------------------

    if (
      order.orderStatus !==
      'delivered'
    ) {
      throw new ApiError(
        400,
        'COD payment can only be marked as collected after the order is delivered'
      );
    }

    // -------------------------------------------------------
    // Mark COD paid
    // -------------------------------------------------------

    order.paymentStatus =
      'paid';

    await order.save();

    sendSuccess(
      res,
      200,
      'COD payment marked as collected',
      {
        order,
      }
    );
  }
);