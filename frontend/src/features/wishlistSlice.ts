import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { wishlistApi } from '../services/cartService';
import { getErrorMessage } from '../services/api';
import { Product } from '../types';

interface WishlistState {
  products: Product[];
  status: 'idle' | 'loading' | 'failed';
}

const initialState: WishlistState = { products: [], status: 'idle' };

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  const { data } = await wishlistApi.get();
  return (data.data.wishlist?.products || []) as Product[];
});

export const addToWishlist = createAsyncThunk('wishlist/add', async (productId: string, { rejectWithValue }) => {
  try {
    const { data } = await wishlistApi.add(productId);
    toast.success('Added to wishlist');
    return (data.data.wishlist?.products || []) as Product[];
  } catch (err) {
    const msg = getErrorMessage(err);
    toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId: string) => {
  const { data } = await wishlistApi.remove(productId);
  return (data.data.wishlist?.products || []) as Product[];
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    resetWishlist: (state) => {
      state.products = [];
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type.startsWith('wishlist/') && action.type.endsWith('/fulfilled'),
      (s, a: any) => {
        s.status = 'idle';
        s.products = a.payload;
      }
    );
  },
});

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
