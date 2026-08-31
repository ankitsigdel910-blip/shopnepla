import asyncHandler from 'express-async-handler';
import { Response } from 'express';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';

const getOrCreateWishlist = async (userId: string) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [] });
  return wishlist;
};

// @route  GET /api/wishlist
// @access Private
export const getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const wishlist = await Wishlist.findOne({ user: req.user!.id }).populate(
    'products',
    'name images price discountPrice stock isActive rating'
  );
  sendSuccess(res, 200, 'Wishlist retrieved successfully', {
    wishlist: wishlist || { products: [] },
    count: wishlist?.products.length || 0,
  });
});

// @route  POST /api/wishlist/:productId
// @access Private
export const addToWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.productId);
  if (!product) throw new ApiError(404, 'Product not found');

  const wishlist = await getOrCreateWishlist(req.user!.id);
  if (!wishlist.products.some((p) => p.toString() === req.params.productId)) {
    wishlist.products.push(product._id);
    await wishlist.save();
  }
  await wishlist.populate('products', 'name images price discountPrice stock isActive rating');

  sendSuccess(res, 200, 'Product added to wishlist', { wishlist, count: wishlist.products.length });
});

// @route  DELETE /api/wishlist/:productId
// @access Private
export const removeFromWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const wishlist = await getOrCreateWishlist(req.user!.id);
  wishlist.products = wishlist.products.filter((p) => p.toString() !== req.params.productId);
  await wishlist.save();
  await wishlist.populate('products', 'name images price discountPrice stock isActive rating');

  sendSuccess(res, 200, 'Product removed from wishlist', { wishlist, count: wishlist.products.length });
});
