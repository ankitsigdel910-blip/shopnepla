import {
  Schema,
  model,
  Document,
  Types,
} from 'mongoose';

import slugify from 'slugify';

export interface IProduct
  extends Document {
  _id: Types.ObjectId;

  name: string;
  slug: string;
  description: string;

  price: number;
  discountPrice?: number;

  images: string[];

  category: Types.ObjectId;

  brand?: string;

  stock: number;

  sku: string;

  rating: number;
  numReviews: number;

  isFeatured: boolean;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const productSchema =
  new Schema<IProduct>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      slug: {
        type: String,
        unique: true,
        index: true,
      },

      description: {
        type: String,
        required: true,
        trim: true,
      },

      price: {
        type: Number,
        required: true,
        min: 0,
      },

      discountPrice: {
        type: Number,
        min: 0,
        default: null,
      },

      images: {
        type: [String],
        default: [],
      },

      category: {
        type:
          Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },

      brand: {
        type: String,
        default: '',
        trim: true,
      },

      stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      sku: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
      },

      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },

      numReviews: {
        type: Number,
        default: 0,
        min: 0,
      },

      isFeatured: {
        type: Boolean,
        default: false,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

/*
 * Generate slug only for new products
 * or when the product name changes.
 *
 * This prevents the URL from changing
 * when stock/status/etc. is updated.
 */
productSchema.pre(
  'validate',
  function (next) {
    if (
      this.isNew ||
      this.isModified('name')
    ) {
      const baseSlug =
        slugify(
          this.name,
          {
            lower: true,
            strict: true,
          }
        );

      this.slug =
        `${baseSlug}-${Date.now().toString(36)}`;
    }

    next();
  }
);

productSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
});

export default model<IProduct>(
  'Product',
  productSchema
);