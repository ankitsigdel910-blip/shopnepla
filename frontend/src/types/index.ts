export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  avatar?: string;
  isActive: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category:
    | Category
    | string;
  brand?: string;
  stock: number;
  sku: string;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Review {
  _id: string;

  user: {
    _id: string;
    name: string;
    avatar?: string;
  };

  product: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
  totalAmount: number;
}

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  city: string;
  street: string;
  postalCode?: string;
  isDefault: boolean;
}

/*
 * ShopNepal currently supports:
 *
 * 1. eSewa
 * 2. Cash on Delivery
 */
export type PaymentMethod =
  | 'esewa'
  | 'cod';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;

  items: OrderItem[];

  shippingAddress: Omit<
    Address,
    '_id' | 'isDefault'
  >;

  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;

  transactionId?: string;

  createdAt: string;
}

export interface ApiResponse<
  T = unknown
> {
  success: boolean;
  message: string;
  data: T;
}