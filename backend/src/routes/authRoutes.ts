import {
  Router,
} from 'express';

import {
  body,
} from 'express-validator';

import multer from 'multer';

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

/* ============================================================
   ROUTER
============================================================ */

const router =
  Router();

/* ============================================================
   AVATAR FILE TYPES
============================================================ */

const avatarMimeTypes =
  new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);

/* ============================================================
   AVATAR UPLOADER

   Avatar files are stored temporarily in memory.

   The controller receives the image through:

   req.file.buffer

   and uploads it to Cloudinary.

   This avoids storing profile images on Render's temporary
   filesystem.
============================================================ */

const avatarUpload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      // Maximum avatar size = 5 MB
      fileSize:
        5 *
        1024 *
        1024,

      files: 1,
    },

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
        ) as any
      );
    },
  });

/* ============================================================
   REGISTER
============================================================ */

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
      .trim()
      .isEmail()
      .withMessage(
        'A valid email is required'
      )
      .normalizeEmail(),

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

    body(
      'confirmPassword'
    )
      .notEmpty()
      .withMessage(
        'Confirm password is required'
      ),

    body(
      'confirmPassword'
    ).custom(
      (
        value,
        {
          req,
        }
      ) => {
        if (
          value !==
          req.body.password
        ) {
          throw new Error(
            'Password and confirm password do not match'
          );
        }

        return true;
      }
    ),
  ],

  validate,

  register
);

/* ============================================================
   LOGIN
============================================================ */

router.post(
  '/login',

  [
    body('password')
      .notEmpty()
      .withMessage(
        'Password is required'
      ),

    body().custom(
      (value) => {
        const email =
          String(
            value.email || ''
          ).trim();

        const phone =
          String(
            value.phone || ''
          ).trim();

        if (
          !email &&
          !phone
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

/* ============================================================
   LOGOUT
============================================================ */

router.post(
  '/logout',

  protect,

  logout
);

/* ============================================================
   CURRENT USER
============================================================ */

router.get(
  '/me',

  protect,

  getMe
);

/* ============================================================
   UPDATE PROFILE + CLOUDINARY AVATAR
============================================================ */

router.put(
  '/profile',

  protect,

  avatarUpload.single(
    'avatar'
  ),

  updateProfile
);

/* ============================================================
   CHANGE PASSWORD
============================================================ */

router.put(
  '/change-password',

  protect,

  [
    body(
      'currentPassword'
    )
      .notEmpty()
      .withMessage(
        'Current password is required'
      ),

    body(
      'newPassword'
    )
      .isLength({
        min: 8,
      })
      .withMessage(
        'New password must be at least 8 characters'
      ),

    body(
      'confirmNewPassword'
    )
      .notEmpty()
      .withMessage(
        'Confirm new password is required'
      ),

    body(
      'confirmNewPassword'
    ).custom(
      (
        value,
        {
          req,
        }
      ) => {
        if (
          value !==
          req.body.newPassword
        ) {
          throw new Error(
            'New password and confirmation do not match'
          );
        }

        return true;
      }
    ),
  ],

  validate,

  changePassword
);

/* ============================================================
   FORGOT PASSWORD
============================================================ */

router.post(
  '/forgot-password',

  [
    body('email')
      .trim()
      .isEmail()
      .withMessage(
        'A valid email is required'
      )
      .normalizeEmail(),
  ],

  validate,

  forgotPassword
);

/* ============================================================
   RESET PASSWORD
============================================================ */

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

    body(
      'confirmPassword'
    )
      .notEmpty()
      .withMessage(
        'Confirm password is required'
      ),

    body(
      'confirmPassword'
    ).custom(
      (
        value,
        {
          req,
        }
      ) => {
        if (
          value !==
          req.body.password
        ) {
          throw new Error(
            'Passwords do not match'
          );
        }

        return true;
      }
    ),
  ],

  validate,

  resetPassword
);

/* ============================================================
   EXPORT ROUTER
============================================================ */

export default router;