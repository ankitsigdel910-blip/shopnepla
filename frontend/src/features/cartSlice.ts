import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { cartApi } from '../services/cartService';
import { getErrorMessage } from '../services/api';
import { Cart } from '../types';

interface CartState {
  cart: Cart;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: CartState = { cart: { items: [], totalAmount: 0 }, status: 'idle' };

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  const { data } = await cartApi.get();
  return data.data.cart as Cart;
});

export const addToCart = createAsyncThunk(
  'cart/add',
  async (payload: { productId: string; quantity?: number }, { rejectWithValue }) => {
    try {
      const { data } = await cartApi.add(payload.productId, payload.quantity);
      toast.success('Added to cart');
      return data.data.cart as Cart;
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async (payload: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const { data } = await cartApi.update(payload.productId, payload.quantity);
      return data.data.cart as Cart;
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const removeCartItem = createAsyncThunk('cart/remove', async (productId: string) => {
  const { data } = await cartApi.remove(productId);
  return data.data.cart as Cart;
});

export const clearCart = createAsyncThunk('cart/clear', async () => {
  const { data } = await cartApi.clear();
  return data.data.cart as Cart;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.cart = { items: [], totalAmount: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (s) => {
        s.status = 'loading';
      })
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/fulfilled'),
        (s, a: any) => {
          s.status = 'idle';
          if (a.payload?.items !== undefined) s.cart = a.payload;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/rejected'),
        (s) => {
          s.status = 'failed';
        }
      );
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
