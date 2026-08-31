import api from './api';

export interface ProductQuery {
  search?: string;
  category?: string;
  brand?: string;

  minPrice?: number;
  maxPrice?: number;

  rating?: number;
  inStock?: boolean;

  sort?: string;

  page?: number;
  limit?: number;

  featured?: boolean;

  // Only products currently on sale / discount
  deals?: boolean;
}

export const productApi = {
  list: (
    query: ProductQuery = {}
  ) =>
    api.get('/products', {
      params: query,
    }),

  get: (id: string) =>
    api.get(`/products/${id}`),

  review: (
    id: string,
    payload: {
      rating: number;
      comment: string;
    }
  ) =>
    api.post(
      `/products/${id}/reviews`,
      payload
    ),
};

export const categoryApi = {
  list: () =>
    api.get('/categories'),
};