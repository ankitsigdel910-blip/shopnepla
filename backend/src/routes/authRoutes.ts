import {
  Router,
} from 'express';

import {
  body,
} from 'express-validator';

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';

import {
  protect,
} from '../middleware/auth';

import {
  validate,
} from '../middleware/validate';

import ApiError from '../utils/ApiError';

const router =
  Router();

// ============================================================
// AVATAR UPLOAD DIRECTORY
// ============================================================

const avatarDirectory =
  path.resolve(
    process.cwd(),
    'uploads',
    'avatars'
  );

fs.mkdirSync(
  avatarDirectory,
  {
    recursive: true,
  }
);

// ============================================================
// AVATAR STORAGE
// ============================================================

const avatarStorage =
  multer.diskStorage({
    destination: (
      _req,
      _file,
      callback
    ) => {
      callback(
        null,
        avatarDirectory
      );
    },

    filename: (
      _req,
      file,
      callback
    ) => {
      const extension =
        path
          .extname(
            file.originalname
          )
          .toLowerCase();

      const uniqueName =
        `${Date.now()}-${crypto
          .randomBytes(8)
          .toString(
            'hex'
          )}${extension}`;

      callback(
        null,
        uniqueName
      );
    },
  });

// ============================================================
// AVATAR FILE TYPES
// ============================================================

const avatarMimeTypes =
  new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);

// ============================================================
// AVATAR UPLOADER
// ============================================================

const avatarUpload =
  multer({
    storage:
      avatarStorage,

    fileFilter: (
      _req,
      file,
      callback
    ) => {
      if (
        avatarMimeTypes.has(
          file.mimetype
        )
      ) {
        callback(
          null,
          true
        );

        return;
      }

      callback(
        new ApiError(
          400,
          'Only JPG, PNG and WebP profile images are allowed'
        ) as any,
        false
      );
    },

    limits: {
      fileSize:
        5 *
        1024 *
        1024,

      files: 1,
    },
  });

// ============================================================
// REGISTER
// ============================================================

router.post(
  '/register',

  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage(
        'Full name is required'
      ),

    body('email')
      .isEmail()
      .withMessage(
        'A valid email is required'
      ),

    body('phone')
      .trim()
      .notEmpty()
      .withMessage(
        'Phone number is required'
      ),

    body('password')
      .isLength({
        min: 8,
      })
      .withMessage(
        'Password must be at least 8 characters'
      ),

    body('confirmPassword')
      .notEmpty()
      .withMessage(
        'Confirm password is required'
      ),
  ],

  validate,

  register
);

// ============================================================
// LOGIN
// ============================================================

router.post(
  '/login',

  [
    body('password')
      .notEmpty()
      .withMessage(
        'Password is required'
      ),

    body().custom(
      (
        value
      ) => {
        if (
          !value.email &&
          !value.phone
        ) {
          throw new Error(
            'Email or phone is required'
          );
        }

        return true;
      }
    ),
  ],

  validate,

  login
);

// ============================================================
// LOGOUT
// ============================================================

router.post(
  '/logout',

  protect,

  logout
);

// ============================================================
// CURRENT USER
// ============================================================

router.get(
  '/me',

  protect,

  getMe
);

// ============================================================
// UPDATE PROFILE + AVATAR
// ============================================================

router.put(
  '/profile',

  protect,

  avatarUpload.single(
    'avatar'
  ),

  updateProfile
);

// ============================================================
// CHANGE PASSWORD
// ============================================================

router.put(
  '/change-password',

  protect,

  [
    body(
      'newPassword'
    )
      .isLength({
        min: 8,
      })
      .withMessage(
        'New password must be at least 8 characters'
      ),
  ],

  validate,

  changePassword
);

// ============================================================
// FORGOT PASSWORD
// ============================================================

router.post(
  '/forgot-password',

  [
    body('email')
      .isEmail()
      .withMessage(
        'A valid email is required'
      ),
  ],

  validate,

  forgotPassword
);

// ============================================================
// RESET PASSWORD
// ============================================================

router.post(
  '/reset-password/:token',

  [
    body('password')
      .isLength({
        min: 8,
      })
      .withMessage(
        'Password must be at least 8 characters'
      ),
  ],

  validate,

  resetPassword
);

export default router;