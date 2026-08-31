import api from './api';

export const cartApi = {
  get: () => api.get('/cart'),
  add: (productId: string, quantity = 1) => api.post('/cart', { productId, quantity }),
  update: (productId: string, quantity: number) => api.put(`/cart/${productId}`, { quantity }),
  remove: (productId: string) => api.delete(`/cart/${productId}`),
  clear: () => api.delete('/cart'),
};

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (productId: string) => api.post(`/wishlist/${productId}`),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
};
