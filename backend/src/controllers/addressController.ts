import asyncHandler from 'express-async-handler';
import { Response } from 'express';
import Address from '../models/Address';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';

// @route  GET /api/addresses
// @access Private
export const getAddresses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const addresses = await Address.find({ user: req.user!.id }).sort({ isDefault: -1, createdAt: -1 });
  sendSuccess(res, 200, 'Addresses retrieved successfully', { addresses });
});

// @route  POST /api/addresses
// @access Private
export const createAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { fullName, phone, province, district, city, street, postalCode, isDefault } = req.body;
  if (!fullName || !phone || !province || !district || !city || !street) {
    throw new ApiError(400, 'fullName, phone, province, district, city and street are required');
  }

  if (isDefault) {
    await Address.updateMany({ user: req.user!.id }, { isDefault: false });
  }

  const address = await Address.create({
    user: req.user!.id,
    fullName,
    phone,
    province,
    district,
    city,
    street,
    postalCode,
    isDefault: !!isDefault,
  });

  sendSuccess(res, 201, 'Address added successfully', { address });
});

// @route  PUT /api/addresses/:id
// @access Private
export const updateAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user!.id });
  if (!address) throw new ApiError(404, 'Address not found');

  const { fullName, phone, province, district, city, street, postalCode, isDefault } = req.body;
  if (fullName) address.fullName = fullName;
  if (phone) address.phone = phone;
  if (province) address.province = province;
  if (district) address.district = district;
  if (city) address.city = city;
  if (street) address.street = street;
  if (postalCode !== undefined) address.postalCode = postalCode;

  if (isDefault) {
    await Address.updateMany({ user: req.user!.id }, { isDefault: false });
    address.isDefault = true;
  }

  await address.save();
  sendSuccess(res, 200, 'Address updated successfully', { address });
});

// @route  DELETE /api/addresses/:id
// @access Private
export const deleteAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user!.id });
  if (!address) throw new ApiError(404, 'Address not found');
  await address.deleteOne();
  sendSuccess(res, 200, 'Address deleted successfully');
});
