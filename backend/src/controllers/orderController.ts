import asyncHandler from 'express-async-handler';
import { Response } from 'express';

import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import Coupon from '../models/Coupon';

import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';

const SHIPPING_FEE_FLAT = 100;

/* ======================================================
   CREATE ORDER
   POST /api/orders

   Body:
   {
     shippingAddress,
     paymentMethod,
     couponCode
   }

   Private
====================================================== */

export const createOrder = asyncHandler(
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const {
      shippingAddress,
      paymentMethod,
      couponCode,
    } = req.body;

    /* --------------------------------------------------
       Basic validation
    -------------------------------------------------- */

    if (
      !shippingAddress ||
      !paymentMethod
    ) {
      throw new ApiError(
        400,
        'shippingAddress and paymentMethod are required'
      );
    }

    const allowedPaymentMethods = [
      'esewa',
      'khalti',
      'cod',
    ];

    if (
      !allowedPaymentMethods.includes(
        paymentMethod
      )
    ) {
      throw new ApiError(
        400,
        'Invalid payment method'
      );
    }

    /* --------------------------------------------------
       Address validation
    -------------------------------------------------- */

    const requiredAddressFields = [
      'fullName',
      'phone',
      'province',
      'district',
      'city',
      'street',
    ];

    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        throw new ApiError(
          400,
          `shippingAddress.${field} is required`
        );
      }
    }

    /* --------------------------------------------------
       Load cart
    -------------------------------------------------- */

    const cart =
      await Cart.findOne({
        user: req.user!.id,
      }).populate(
        'items.product'
      );

    if (
      !cart ||
      cart.items.length === 0
    ) {
      throw new ApiError(
        400,
        'Your cart is empty'
      );
    }

    /* --------------------------------------------------
       Build order items and validate products
    -------------------------------------------------- */

    const orderItems = [];

    let subtotal = 0;

    for (const item of cart.items) {
      const product =
        item.product as any;

      if (
        !product ||
        !product.isActive
      ) {
        throw new ApiError(
          400,
          'A product in your cart is no longer available'
        );
      }

      if (
        item.quantity >
        product.stock
      ) {
        throw new ApiError(
          400,
          `Only ${product.stock} unit(s) of "${product.name}" available`
        );
      }

      /*
       * Use discount price only when
       * it is actually a valid discount.
       */
      const hasDiscount =
        product.discountPrice != null &&
        Number(product.discountPrice) >
          0 &&
        Number(product.discountPrice) <
          Number(product.price);

      const price = hasDiscount
        ? Number(
            product.discountPrice
          )
        : Number(product.price);

      subtotal +=
        price *
        item.quantity;

      orderItems.push({
        product:
          product._id,

        name:
          product.name,

        image:
          product.images?.[0] ||
          '',

        price,

        quantity:
          item.quantity,
      });
    }

    /* --------------------------------------------------
       Coupon
    -------------------------------------------------- */

    let discount = 0;

    if (couponCode) {
      const normalizedCouponCode =
        String(couponCode)
          .trim()
          .toUpperCase();

      const coupon =
        await Coupon.findOne({
          code:
            normalizedCouponCode,

          isActive: true,
        });

      if (!coupon) {
        throw new ApiError(
          404,
          'Invalid or inactive coupon code'
        );
      }

      if (
        coupon.expiresAt &&
        coupon.expiresAt <
          new Date()
      ) {
        throw new ApiError(
          400,
          'This coupon has expired'
        );
      }

      if (
        subtotal <
        coupon.minimumOrderAmount
      ) {
        throw new ApiError(
          400,
          `Minimum order amount for this coupon is ${coupon.minimumOrderAmount}`
        );
      }

      if (
        coupon.discountType ===
        'percentage'
      ) {
        discount =
          (subtotal *
            coupon.discountValue) /
          100;
      } else {
        discount =
          coupon.discountValue;
      }

      if (
        coupon.maximumDiscount
      ) {
        discount = Math.min(
          discount,
          coupon.maximumDiscount
        );
      }

      /*
       * Discount can never exceed
       * the subtotal.
       */
      discount = Math.min(
        discount,
        subtotal
      );
    }

    /* --------------------------------------------------
       Totals
    -------------------------------------------------- */

    const shippingFee =
      SHIPPING_FEE_FLAT;

    const totalAmount =
      Math.max(
        0,
        subtotal +
          shippingFee -
          discount
      );

    /* --------------------------------------------------
       Deduct stock

       We use an atomic condition:
       stock >= requested quantity.

       This reduces overselling risk even
       without MongoDB transactions.
    -------------------------------------------------- */

    const deductedItems: Array<{
      productId: string;
      quantity: number;
    }> = [];

    let orderCreated = false;

    try {
      for (
        let index = 0;
        index <
        orderItems.length;
        index++
      ) {
        const orderItem =
          orderItems[index];

        const updatedProduct =
          await Product.findOneAndUpdate(
            {
              _id:
                orderItem.product,

              isActive: true,

              stock: {
                $gte:
                  orderItem.quantity,
              },
            },
            {
              $inc: {
                stock:
                  -orderItem.quantity,
              },
            },
            {
              new: true,
            }
          );

        if (!updatedProduct) {
          throw new ApiError(
            400,
            `"${orderItem.name}" does not have enough stock`
          );
        }

        deductedItems.push({
          productId:
            orderItem.product.toString(),

          quantity:
            orderItem.quantity,
        });
      }

      /* ------------------------------------------------
         Create order
      ------------------------------------------------ */

      const order =
        await Order.create({
          user:
            req.user!.id,

          items:
            orderItems,

          shippingAddress,

          subtotal,

          shippingFee,

          discount,

          totalAmount,

          paymentMethod,

          /*
           * All payment methods begin as pending.
           *
           * eSewa/Khalti become paid only after
           * server-side payment verification.
           *
           * COD remains pending until collected.
           */
          paymentStatus:
            'pending',

          orderStatus:
            'pending',
        });

      orderCreated = true;

      /* ------------------------------------------------
         Clear cart
      ------------------------------------------------ */

      cart.items = [];

      await cart.save();

      sendSuccess(
        res,
        201,
        'Order placed successfully',
        {
          order,
        }
      );
    } catch (error) {
      /*
       * Since this local MongoDB instance does not
       * support transactions, manually restore stock
       * if order creation fails after deduction.
       *
       * If the order was already created, we don't
       * restore stock because doing so would produce
       * an order without reserved inventory.
       */
      if (
        !orderCreated &&
        deductedItems.length >
          0
      ) {
        await Promise.all(
          deductedItems.map(
            (item) =>
              Product.findByIdAndUpdate(
                item.productId,
                {
                  $inc: {
                    stock:
                      item.quantity,
                  },
                }
              )
          )
        );
      }

      throw error;
    }
  }
);

/* ======================================================
   GET MY ORDERS
   GET /api/orders
   Private
====================================================== */

export const getMyOrders =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const orders =
        await Order.find({
          user: req.user!.id,
        }).sort({
          createdAt: -1,
        });

      sendSuccess(
        res,
        200,
        'Orders retrieved successfully',
        {
          orders,
        }
      );
    }
  );

/* ======================================================
   GET ONE ORDER
   GET /api/orders/:id

   Owner or Admin
====================================================== */

export const getOrder =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const order =
        await Order.findById(
          req.params.id
        ).populate(
          'user',
          'name email phone'
        );

      if (!order) {
        throw new ApiError(
          404,
          'Order not found'
        );
      }

      /*
       * After populate(), order.user may
       * be a user document.
       */
      const orderUser =
        order.user as any;

      const orderUserId =
        orderUser?._id
          ? orderUser._id.toString()
          : orderUser.toString();

      if (
        orderUserId !==
          req.user!.id &&
        req.user!.role !==
          'admin'
      ) {
        throw new ApiError(
          403,
          'You are not allowed to view this order'
        );
      }

      sendSuccess(
        res,
        200,
        'Order retrieved successfully',
        {
          order,
        }
      );
    }
  );

/* ======================================================
   CANCEL ORDER
   PUT /api/orders/:id/cancel

   Restocks items.
   Owner only.
====================================================== */

export const cancelOrder =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        throw new ApiError(
          404,
          'Order not found'
        );
      }

      if (
        order.user.toString() !==
        req.user!.id
      ) {
        throw new ApiError(
          403,
          'You are not allowed to cancel this order'
        );
      }

      if (
        ![
          'pending',
          'confirmed',
          'processing',
        ].includes(
          order.orderStatus
        )
      ) {
        throw new ApiError(
          400,
          `Order cannot be cancelled once it is ${order.orderStatus}`
        );
      }

      /*
       * Prevent accidental double-restocking.
       */
      if (
        order.orderStatus ===
        'cancelled'
      ) {
        throw new ApiError(
          400,
          'Order is already cancelled'
        );
      }

      order.orderStatus =
        'cancelled';

      if (
        order.paymentStatus ===
        'paid'
      ) {
        order.paymentStatus =
          'refunded';
      }

      await order.save();

      /*
       * Return inventory.
       */
      await Promise.all(
        order.items.map(
          (item) =>
            Product.findByIdAndUpdate(
              item.product,
              {
                $inc: {
                  stock:
                    item.quantity,
                },
              }
            )
        )
      );

      sendSuccess(
        res,
        200,
        'Order cancelled successfully',
        {
          order,
        }
      );
    }
  );