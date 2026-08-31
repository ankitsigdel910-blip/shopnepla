import asyncHandler from 'express-async-handler';
import { Response } from 'express';

import Category from '../models/Category';
import Product from '../models/Product';

import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';

// ============================================================
// LOCAL CATEGORY IMAGE URL
// ============================================================

const getUploadedCategoryImageUrl = (
  req: AuthRequest
): string => {
  if (!req.file) {
    return '';
  }

  const backendUrl = (
    process.env.BACKEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/$/, '');

  return `${backendUrl}/uploads/categories/${encodeURIComponent(
    req.file.filename
  )}`;
};

// ============================================================
// GET CATEGORIES
// GET /api/categories
// Public
// ============================================================

export const getCategories = asyncHandler(
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    /*
     * Normal customer request:
     *
     * GET /api/categories
     *
     * returns active categories only.
     *
     * Admin:
     *
     * GET /api/categories?all=true
     *
     * returns everything.
     */

    const activeOnly =
      req.query.all !== 'true';

    const filter =
      activeOnly
        ? {
            isActive: true,
          }
        : {};

    const categories =
      await Category.find(
        filter
      ).sort({
        name: 1,
      });

    sendSuccess(
      res,
      200,
      'Categories retrieved successfully',
      {
        categories,
      }
    );
  }
);

// ============================================================
// GET CATEGORY
// GET /api/categories/:id
// Public
// ============================================================

export const getCategory = asyncHandler(
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const category =
      await Category.findById(
        req.params.id
      );

    if (!category) {
      throw new ApiError(
        404,
        'Category not found'
      );
    }

    sendSuccess(
      res,
      200,
      'Category retrieved successfully',
      {
        category,
      }
    );
  }
);

// ============================================================
// CREATE CATEGORY
// POST /api/categories
// Private/Admin
// ============================================================

export const createCategory = asyncHandler(
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const {
      name,
      description,
      isActive,
    } = req.body;

    // ========================================================
    // VALIDATE NAME
    // ========================================================

    if (
      !name ||
      !String(name).trim()
    ) {
      throw new ApiError(
        400,
        'Category name is required'
      );
    }

    // ========================================================
    // CHECK DUPLICATE CATEGORY
    // ========================================================

    const existingCategory =
      await Category.findOne({
        name: {
          $regex:
            `^${String(
              name
            )
              .trim()
              .replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
              )}$`,
          $options: 'i',
        },
      });

    if (existingCategory) {
      throw new ApiError(
        409,
        'A category with this name already exists'
      );
    }

    // ========================================================
    // LOCAL IMAGE
    // ========================================================

    const image =
      getUploadedCategoryImageUrl(
        req
      );

    // ========================================================
    // ACTIVE STATUS
    // ========================================================

    const categoryIsActive =
      isActive === undefined
        ? true
        : isActive === true ||
          isActive === 'true';

    // ========================================================
    // CREATE
    // ========================================================

    const category =
      await Category.create({
        name:
          String(
            name
          ).trim(),

        description:
          description || '',

        image,

        isActive:
          categoryIsActive,
      });

    sendSuccess(
      res,
      201,
      'Category created successfully',
      {
        category,
      }
    );
  }
);

// ============================================================
// UPDATE CATEGORY
// PUT /api/categories/:id
// Private/Admin
// ============================================================

export const updateCategory = asyncHandler(
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const category =
      await Category.findById(
        req.params.id
      );

    if (!category) {
      throw new ApiError(
        404,
        'Category not found'
      );
    }

    const {
      name,
      description,
      isActive,
    } = req.body;

    // ========================================================
    // NAME
    // ========================================================

    if (
      name !== undefined
    ) {
      const cleanName =
        String(name).trim();

      if (!cleanName) {
        throw new ApiError(
          400,
          'Category name cannot be empty'
        );
      }

      /*
       * Check another category doesn't
       * already use this name.
       */

      const duplicate =
        await Category.findOne({
          _id: {
            $ne:
              category._id,
          },

          name: {
            $regex:
              `^${cleanName.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
              )}$`,

            $options: 'i',
          },
        });

      if (duplicate) {
        throw new ApiError(
          409,
          'A category with this name already exists'
        );
      }

      category.name =
        cleanName;
    }

    // ========================================================
    // DESCRIPTION
    // ========================================================

    if (
      description !==
      undefined
    ) {
      category.description =
        description;
    }

    // ========================================================
    // ACTIVE STATUS
    // ========================================================

    if (
      isActive !==
      undefined
    ) {
      category.isActive =
        isActive === true ||
        isActive === 'true';
    }

    // ========================================================
    // NEW LOCAL IMAGE
    // ========================================================

    if (req.file) {
      category.image =
        getUploadedCategoryImageUrl(
          req
        );
    }

    // ========================================================
    // SAVE
    // ========================================================

    await category.save();

    sendSuccess(
      res,
      200,
      'Category updated successfully',
      {
        category,
      }
    );
  }
);

// ============================================================
// DELETE CATEGORY
// DELETE /api/categories/:id
// Private/Admin
// ============================================================

export const deleteCategory = asyncHandler(
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const category =
      await Category.findById(
        req.params.id
      );

    if (!category) {
      throw new ApiError(
        404,
        'Category not found'
      );
    }

    /*
     * Do not allow a category to be
     * deleted while products belong to it.
     */

    const inUse =
      await Product.exists({
        category:
          category._id,
      });

    if (inUse) {
      throw new ApiError(
        409,
        'Cannot delete a category that still has products. Disable it instead.'
      );
    }

    await category.deleteOne();

    sendSuccess(
      res,
      200,
      'Category deleted successfully'
    );
  }
);