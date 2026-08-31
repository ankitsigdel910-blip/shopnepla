import asyncHandler from 'express-async-handler';
import { Response } from 'express';
import Coupon from '../models/Coupon';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';

// @route  POST /api/coupons/validate
// body: { code, orderAmount }
// @access Private
export const validateCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { code, orderAmount } = req.body;
  if (!code || orderAmount === undefined) throw new ApiError(400, 'code and orderAmount are required');

  const coupon = await Coupon.findOne({ code: String(code).toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(404, 'Invalid or inactive coupon code');
  if (coupon.expiresAt < new Date()) throw new ApiError(400, 'This coupon has expired');
  if (orderAmount < coupon.minimumOrderAmount) {
    throw new ApiError(400, `Minimum order amount for this coupon is ${coupon.minimumOrderAmount}`);
  }

  let discount =
    coupon.discountType === 'percentage'
      ? (orderAmount * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
  discount = Math.min(discount, orderAmount);

  sendSuccess(res, 200, 'Coupon applied successfully', {
    code: coupon.code,
    discount: Math.round(discount * 100) / 100,
  });
});

// @route  GET /api/coupons  (admin: list all)
// @access Private/Admin
export const getCoupons = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  sendSuccess(res, 200, 'Coupons retrieved successfully', { coupons });
});

// @route  POST /api/coupons
// @access Private/Admin
export const createCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { code, discountType, discountValue, minimumOrderAmount, maximumDiscount, expiresAt, isActive } =
    req.body;
  if (!code || !discountType || !discountValue || !expiresAt) {
    throw new ApiError(400, 'code, discountType, discountValue and expiresAt are required');
  }
  const coupon = await Coupon.create({
    code,
    discountType,
    discountValue,
    minimumOrderAmount,
    maximumDiscount,
    expiresAt,
    isActive,
  });
  sendSuccess(res, 201, 'Coupon created successfully', { coupon });
});

// @route  PUT /api/coupons/:id
// @access Private/Admin
export const updateCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  Object.assign(coupon, req.body);
  await coupon.save();
  sendSuccess(res, 200, 'Coupon updated successfully', { coupon });
});

// @route  DELETE /api/coupons/:id
// @access Private/Admin
export const deleteCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  await coupon.deleteOne();
  sendSuccess(res, 200, 'Coupon deleted successfully');
});
