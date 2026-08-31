import asyncHandler from 'express-async-handler';
import { Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';

const getOrCreateCart = async (userId: string) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// @route  GET /api/cart
// @access Private
export const getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await Cart.findOne({ user: req.user!.id }).populate(
    'items.product',
    'name images price discountPrice stock isActive'
  );
  sendSuccess(res, 200, 'Cart retrieved successfully', { cart: cart || { items: [], totalAmount: 0 } });
});

// @route  POST /api/cart
// body: { productId, quantity }
// @access Private
export const addToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) throw new ApiError(400, 'productId is required');

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');

  const cart = await getOrCreateCart(req.user!.id);
  const existingItem = cart.items.find((i) => i.product.toString() === productId);
  const requestedQty = (existingItem?.quantity || 0) + Number(quantity);

  if (requestedQty > product.stock) {
    throw new ApiError(400, `Only ${product.stock} unit(s) of "${product.name}" available in stock`);
  }

  const unitPrice = product.discountPrice || product.price;

  if (existingItem) {
    existingItem.quantity = requestedQty;
    existingItem.price = unitPrice;
  } else {
    cart.items.push({ product: product._id, quantity: Number(quantity), price: unitPrice });
  }

  await cart.save();
  await cart.populate('items.product', 'name images price discountPrice stock isActive');

  sendSuccess(res, 200, 'Item added to cart', { cart });
});

// @route  PUT /api/cart/:productId
// body: { quantity }
// @access Private
export const updateCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) throw new ApiError(400, 'quantity must be at least 1');

  const product = await Product.findById(req.params.productId);
  if (!product) throw new ApiError(404, 'Product not found');
  if (quantity > product.stock) {
    throw new ApiError(400, `Only ${product.stock} unit(s) of "${product.name}" available in stock`);
  }

  const cart = await getOrCreateCart(req.user!.id);
  const item = cart.items.find((i) => i.product.toString() === req.params.productId);
  if (!item) throw new ApiError(404, 'Item not found in cart');

  item.quantity = Number(quantity);
  item.price = product.discountPrice || product.price;

  await cart.save();
  await cart.populate('items.product', 'name images price discountPrice stock isActive');

  sendSuccess(res, 200, 'Cart item updated', { cart });
});

// @route  DELETE /api/cart/:productId
// @access Private
export const removeCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate('items.product', 'name images price discountPrice stock isActive');
  sendSuccess(res, 200, 'Item removed from cart', { cart });
});

// @route  DELETE /api/cart
// @access Private
export const clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  cart.items = [];
  await cart.save();
  sendSuccess(res, 200, 'Cart cleared', { cart });
});
