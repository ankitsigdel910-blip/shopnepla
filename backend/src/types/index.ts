import { Request } from 'express';
import { Types } from 'mongoose';

export type UserRole = 'customer' | 'admin';

export type PaymentMethod = 'esewa'  | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface JwtPayload {
  id: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    _id: Types.ObjectId;
    role: UserRole;
    email: string;
  };
}
