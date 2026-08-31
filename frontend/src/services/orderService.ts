import api from './api';

import {
  Address,
  PaymentMethod,
} from '../types';

/* =====================================================
   ADDRESS TYPES
===================================================== */

type CreateAddressPayload =
  Omit<
    Address,
    '_id' | 'isDefault'
  > & {
    isDefault?: boolean;
  };

/* =====================================================
   ADDRESS API
===================================================== */

export const addressApi = {
  list: () =>
    api.get('/addresses'),

  create: (
    payload: CreateAddressPayload
  ) =>
    api.post(
      '/addresses',
      payload
    ),

  update: (
    id: string,
    payload: Partial<Address>
  ) =>
    api.put(
      `/addresses/${id}`,
      payload
    ),

  remove: (
    id: string
  ) =>
    api.delete(
      `/addresses/${id}`
    ),
};

/* =====================================================
   COUPON API
===================================================== */

export const couponApi = {
  validate: (
    code: string,
    orderAmount: number
  ) =>
    api.post(
      '/coupons/validate',
      {
        code,
        orderAmount,
      }
    ),
};

/* =====================================================
   ORDER API
===================================================== */

export const orderApi = {
  create: (
    payload: {
      shippingAddress: Omit<
        Address,
        '_id' | 'isDefault'
      >;

      paymentMethod:
        PaymentMethod;

      couponCode?: string;
    }
  ) =>
    api.post(
      '/orders',
      payload
    ),

  myOrders: () =>
    api.get('/orders'),

  get: (
    id: string
  ) =>
    api.get(
      `/orders/${id}`
    ),

  cancel: (
    id: string
  ) =>
    api.put(
      `/orders/${id}/cancel`
    ),
};

/* =====================================================
   PAYMENT API
===================================================== */

export const paymentApi = {
  initiateEsewa: (
    orderId: string
  ) =>
    api.post(
      `/payments/esewa/initiate/${orderId}`
    ),
};