import asyncHandler from 'express-async-handler';
import { Response } from 'express';

import Product from '../models/Product';
import Review from '../models/Review';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';

// ======================================================
// LOCAL PRODUCT IMAGE HELPER
// ======================================================
//
// Multer saves files to:
//
// backend/uploads/products/
//
// This converts each saved filename into a URL:
//
// http://localhost:5000/uploads/products/example.webp
//

const getUploadedImageUrls = (
  req: AuthRequest
): string[] => {
  const files =
    (req.files as Express.Multer.File[]) ||
    [];

  const backendUrl =
    (
      process.env.BACKEND_URL ||
      `http://localhost:${
        process.env.PORT || 5000
      }`
    ).replace(/\/$/, '');

  return files.map(
    (file) =>
      `${backendUrl}/uploads/products/${encodeURIComponent(
        file.filename
      )}`
  );
};

// ======================================================
// GET PRODUCTS
// GET /api/products
// Public
// ======================================================

export const getProducts = asyncHandler(
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      sort,
      page = '1',
      limit = '12',
      featured,
      deals,
    } = req.query as Record<
      string,
      string
    >;

    const filter: Record<
      string,
      any
    > = {
      isActive: true,
    };

    // ==================================================
    // SEARCH
    // ==================================================

    if (search) {
      const cleanSearch =
        search.trim();

      if (cleanSearch) {
        filter.$or = [
          {
            name: {
              $regex:
                cleanSearch,
              $options: 'i',
            },
          },
          {
            description: {
              $regex:
                cleanSearch,
              $options: 'i',
            },
          },
          {
            brand: {
              $regex:
                cleanSearch,
              $options: 'i',
            },
          },
        ];
      }
    }

    // ==================================================
    // CATEGORY
    // ==================================================

    if (category) {
      filter.category =
        category;
    }

    // ==================================================
    // BRAND
    // ==================================================

    if (brand) {
      filter.brand = {
        $regex:
          brand.trim(),
        $options: 'i',
      };
    }

    // ==================================================
    // FEATURED
    // ==================================================

    if (
      featured === 'true'
    ) {
      filter.isFeatured =
        true;
    }

    // ==================================================
    // DEALS
    // ==================================================

    if (deals === 'true') {
      filter.discountPrice = {
        $exists: true,
        $ne: null,
        $gt: 0,
      };

      filter.$expr = {
        $lt: [
          '$discountPrice',
          '$price',
        ],
      };
    }

    // ==================================================
    // STOCK
    // ==================================================

    if (
      inStock === 'true'
    ) {
      filter.stock = {
        $gt: 0,
      };
    }

    // ==================================================
    // RATING
    // ==================================================

    if (rating) {
      const ratingNumber =
        Number(rating);

      if (
        Number.isFinite(
          ratingNumber
        )
      ) {
        filter.rating = {
          $gte:
            ratingNumber,
        };
      }
    }

    // ==================================================
    // PRICE RANGE
    // ==================================================

    if (
      minPrice ||
      maxPrice
    ) {
      filter.price = {};

      if (minPrice) {
        const minimum =
          Number(minPrice);

        if (
          Number.isFinite(
            minimum
          )
        ) {
          filter.price.$gte =
            minimum;
        }
      }

      if (maxPrice) {
        const maximum =
          Number(maxPrice);

        if (
          Number.isFinite(
            maximum
          )
        ) {
          filter.price.$lte =
            maximum;
        }
      }

      if (
        Object.keys(
          filter.price
        ).length === 0
      ) {
        delete filter.price;
      }
    }

    // ==================================================
    // SORT
    // ==================================================

    let sortOption: Record<
      string,
      1 | -1
    > = {
      createdAt: -1,
    };

    switch (sort) {
      case 'price_asc':
        sortOption = {
          price: 1,
        };

        break;

      case 'price_desc':
        sortOption = {
          price: -1,
        };

        break;

      case 'rating':
        sortOption = {
          rating: -1,
          numReviews: -1,
        };

        break;

      case 'popular':
        sortOption = {
          numReviews: -1,
          rating: -1,
        };

        break;

      case 'newest':
      default:
        sortOption = {
          createdAt: -1,
        };

        break;
    }

    // ==================================================
    // PAGINATION
    // ==================================================

    const pageNum =
      Math.max(
        1,
        parseInt(
          page,
          10
        ) || 1
      );

    const limitNum =
      Math.min(
        50,
        Math.max(
          1,
          parseInt(
            limit,
            10
          ) || 12
        )
      );

    const skip =
      (pageNum - 1) *
      limitNum;

    // ==================================================
    // DATABASE
    // ==================================================

    const [
      products,
      total,
    ] = await Promise.all([
      Product.find(filter)
        .populate(
          'category',
          'name slug'
        )
        .sort(
          sortOption
        )
        .skip(skip)
        .limit(
          limitNum
        ),

      Product.countDocuments(
        filter
      ),
    ]);

    sendSuccess(
      res,
      200,

      deals === 'true'
        ? 'Deals retrieved successfully'
        : 'Products retrieved successfully',

      {
        products,

        pagination: {
          page:
            pageNum,

          limit:
            limitNum,

          total,

          totalPages:
            Math.ceil(
              total /
                limitNum
            ),
        },
      }
    );
  }
);

// ======================================================
// GET PRODUCT
// GET /api/products/:id
// Public
// ======================================================

export const getProduct =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const product =
        await Product.findById(
          req.params.id
        ).populate(
          'category',
          'name slug'
        );

      if (!product) {
        throw new ApiError(
          404,
          'Product not found'
        );
      }

      const [
        reviews,
        related,
      ] =
        await Promise.all([
          Review.find({
            product:
              product._id,
          })
            .populate(
              'user',
              'name avatar'
            )
            .sort({
              createdAt:
                -1,
            }),

          Product.find({
            category:
              product.category,

            _id: {
              $ne:
                product._id,
            },

            isActive:
              true,
          }).limit(8),
        ]);

      sendSuccess(
        res,
        200,
        'Product retrieved successfully',
        {
          product,
          reviews,
          related,
        }
      );
    }
  );

// ======================================================
// CREATE PRODUCT
// POST /api/products
// Private/Admin
// ======================================================

export const createProduct =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const {
        name,
        description,
        price,
        discountPrice,
        category,
        brand,
        stock,
        sku,
        isFeatured,
      } = req.body;

      // ==================================================
      // REQUIRED FIELDS
      // ==================================================

      if (
        !name ||
        !description ||
        !price ||
        !category ||
        !sku
      ) {
        throw new ApiError(
          400,
          'name, description, price, category and sku are required'
        );
      }

      // ==================================================
      // PRICE
      // ==================================================

      const numericPrice =
        Number(price);

      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice <= 0
      ) {
        throw new ApiError(
          400,
          'Price must be greater than 0'
        );
      }

      // ==================================================
      // DISCOUNT
      // ==================================================

      const numericDiscountPrice =
        discountPrice !==
          undefined &&
        discountPrice !== ''
          ? Number(
              discountPrice
            )
          : undefined;

      if (
        numericDiscountPrice !==
          undefined &&
        (
          !Number.isFinite(
            numericDiscountPrice
          ) ||
          numericDiscountPrice <=
            0 ||
          numericDiscountPrice >=
            numericPrice
        )
      ) {
        throw new ApiError(
          400,
          'Discount price must be greater than 0 and less than the regular price'
        );
      }

      // ==================================================
      // STOCK
      // ==================================================

      const numericStock =
        stock !== undefined &&
        stock !== ''
          ? Number(stock)
          : 0;

      if (
        !Number.isFinite(
          numericStock
        ) ||
        numericStock < 0
      ) {
        throw new ApiError(
          400,
          'Stock cannot be negative'
        );
      }

      // ==================================================
      // LOCAL IMAGES
      // ==================================================

      const images =
        getUploadedImageUrls(
          req
        );

      // ==================================================
      // CREATE
      // ==================================================

      const product =
        await Product.create({
          name,
          description,

          price:
            numericPrice,

          discountPrice:
            numericDiscountPrice,

          category,

          brand:
            brand || '',

          stock:
            numericStock,

          sku,

          images,

          isFeatured:
            isFeatured ===
              'true' ||
            isFeatured ===
              true,

          isActive: true,
        });

      sendSuccess(
        res,
        201,
        'Product created successfully',
        {
          product,
        }
      );
    }
  );

// ======================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// Private/Admin
// ======================================================

export const updateProduct =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        throw new ApiError(
          404,
          'Product not found'
        );
      }

      // ==================================================
      // BASIC FIELDS
      // ==================================================

      const fields = [
        'name',
        'description',
        'category',
        'brand',
        'sku',
      ] as const;

      for (
        const field
        of fields
      ) {
        if (
          req.body[
            field
          ] !== undefined
        ) {
          (
            product as any
          )[field] =
            req.body[
              field
            ];
        }
      }

      // ==================================================
      // PRICE
      // ==================================================

      if (
        req.body.price !==
        undefined
      ) {
        const numericPrice =
          Number(
            req.body.price
          );

        if (
          !Number.isFinite(
            numericPrice
          ) ||
          numericPrice <= 0
        ) {
          throw new ApiError(
            400,
            'Price must be greater than 0'
          );
        }

        product.price =
          numericPrice;
      }

      // ==================================================
      // DISCOUNT PRICE
      // ==================================================

      if (
        req.body
          .discountPrice !==
        undefined
      ) {
        if (
          req.body
            .discountPrice ===
            '' ||
          req.body
            .discountPrice ===
            null
        ) {
          product.discountPrice =
            undefined;
        } else {
          const numericDiscount =
            Number(
              req.body
                .discountPrice
            );

          if (
            !Number.isFinite(
              numericDiscount
            ) ||
            numericDiscount <=
              0 ||
            numericDiscount >=
              product.price
          ) {
            throw new ApiError(
              400,
              'Discount price must be greater than 0 and less than the regular price'
            );
          }

          product.discountPrice =
            numericDiscount;
        }
      }

      // ==================================================
      // VALIDATE EXISTING DISCOUNT AFTER PRICE CHANGE
      // ==================================================

      if (
        product.discountPrice !=
          null &&
        product.discountPrice >=
          product.price
      ) {
        throw new ApiError(
          400,
          'Discount price must be less than the regular price'
        );
      }

      // ==================================================
      // STOCK
      // ==================================================

      if (
        req.body.stock !==
        undefined
      ) {
        const numericStock =
          Number(
            req.body.stock
          );

        if (
          !Number.isFinite(
            numericStock
          ) ||
          numericStock < 0
        ) {
          throw new ApiError(
            400,
            'Stock cannot be negative'
          );
        }

        product.stock =
          numericStock;
      }

      // ==================================================
      // FEATURED
      // ==================================================

      if (
        req.body
          .isFeatured !==
        undefined
      ) {
        product.isFeatured =
          req.body
            .isFeatured ===
            'true' ||
          req.body
            .isFeatured ===
            true;
      }

      // ==================================================
      // ACTIVE
      // ==================================================

      if (
        req.body.isActive !==
        undefined
      ) {
        product.isActive =
          req.body
            .isActive ===
            'true' ||
          req.body
            .isActive ===
            true;
      }

      // ==================================================
      // LOCAL PRODUCT IMAGES
      // ==================================================

      const newImages =
        getUploadedImageUrls(
          req
        );

      if (
        newImages.length >
        0
      ) {
        /*
         * APPEND MODE
         *
         * Existing images remain.
         * New images are added.
         */
        product.images = [
          ...product.images,
          ...newImages,
        ];
      }

      // ==================================================
      // SAVE
      // ==================================================

      await product.save();

      sendSuccess(
        res,
        200,
        'Product updated successfully',
        {
          product,
        }
      );
    }
  );

// ======================================================
// DELETE PRODUCT
// DELETE /api/products/:id
// Private/Admin
// ======================================================

export const deleteProduct =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        throw new ApiError(
          404,
          'Product not found'
        );
      }

      await product.deleteOne();

      sendSuccess(
        res,
        200,
        'Product deleted successfully'
      );
    }
  );

// ======================================================
// TOGGLE PRODUCT STATUS
// PUT /api/products/:id/toggle-status
// Private/Admin
// ======================================================

export const toggleProductStatus =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        throw new ApiError(
          404,
          'Product not found'
        );
      }

      product.isActive =
        !product.isActive;

      await product.save();

      sendSuccess(
        res,
        200,

        `Product ${
          product.isActive
            ? 'enabled'
            : 'disabled'
        } successfully`,

        {
          product,
        }
      );
    }
  );

// ======================================================
// CREATE REVIEW
// POST /api/products/:id/reviews
// Private
// ======================================================

export const createReview =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const {
        rating,
        comment,
      } = req.body;

      if (
        !rating ||
        !comment
      ) {
        throw new ApiError(
          400,
          'Rating and comment are required'
        );
      }

      const numericRating =
        Number(rating);

      if (
        !Number.isFinite(
          numericRating
        ) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        throw new ApiError(
          400,
          'Rating must be between 1 and 5'
        );
      }

      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        throw new ApiError(
          404,
          'Product not found'
        );
      }

      // ==================================================
      // CHECK EXISTING REVIEW
      // ==================================================

      const existing =
        await Review.findOne({
          product:
            product._id,

          user:
            req.user!.id,
        });

      if (existing) {
        throw new ApiError(
          409,
          'You have already reviewed this product'
        );
      }

      // ==================================================
      // CREATE REVIEW
      // ==================================================

      await Review.create({
        product:
          product._id,

        user:
          req.user!.id,

        rating:
          numericRating,

        comment,
      });

      // ==================================================
      // RECALCULATE RATING
      // ==================================================

      const stats =
        await Review.aggregate([
          {
            $match: {
              product:
                product._id,
            },
          },

          {
            $group: {
              _id: null,

              avgRating: {
                $avg:
                  '$rating',
              },

              count: {
                $sum: 1,
              },
            },
          },
        ]);

      product.rating =
        stats[0]
          ?.avgRating ||
        0;

      product.numReviews =
        stats[0]
          ?.count || 0;

      await product.save();

      sendSuccess(
        res,
        201,
        'Review submitted successfully',
        {
          product,
        }
      );
    }
  );