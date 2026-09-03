import crypto from 'crypto';

import asyncHandler from 'express-async-handler';

import {
  Response,
} from 'express';

import User from '../models/User';

import ApiError from '../utils/ApiError';

import {
  sendSuccess,
} from '../utils/ApiResponse';

import {
  sendTokenResponse,
} from '../utils/generateToken';

import {
  AuthRequest,
} from '../types';

import {
  sendEmail,
} from '../services/emailService';

import cloudinary, {
  ensureCloudinaryConfigured,
} from '../config/cloudinary';

/* ============================================================
   PUBLIC USER
============================================================ */

const toPublicUser = (
  user: any
) => ({
  id:
    user._id,

  name:
    user.name,

  email:
    user.email,

  phone:
    user.phone,

  role:
    user.role,

  avatar:
    user.avatar,

  isActive:
    user.isActive,

  createdAt:
    user.createdAt,
});

/* ============================================================
   UPLOAD AVATAR TO CLOUDINARY
============================================================ */

const uploadAvatarToCloudinary = (
  file: Express.Multer.File,
  userId: string
): Promise<string> => {
  ensureCloudinaryConfigured();

  if (!file.buffer) {
    return Promise.reject(
      new Error(
        'Avatar file buffer is missing'
      )
    );
  }

  return new Promise(
    (
      resolve,
      reject
    ) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder:
              'shopnepal/avatars',

            /*
             * Each user receives a stable Cloudinary
             * public ID. Uploading another profile
             * picture overwrites the previous image.
             */
            public_id:
              `user-${userId}`,

            overwrite:
              true,

            resource_type:
              'image',

            transformation: [
              {
                width: 500,
                height: 500,
                crop: 'fill',
                gravity: 'auto',
              },

              {
                quality: 'auto',
                fetch_format:
                  'auto',
              },
            ],
          },

          (
            error,
            result
          ) => {
            if (error) {
              reject(error);

              return;
            }

            if (!result) {
              reject(
                new Error(
                  'Cloudinary did not return an upload result'
                )
              );

              return;
            }

            resolve(
              result.secure_url
            );
          }
        );

      uploadStream.end(
        file.buffer
      );
    }
  );
};

/* ============================================================
   REGISTER
   POST /api/auth/register
============================================================ */

export const register =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const {
        name,
        email,
        phone,
        password,
        confirmPassword,
      } =
        req.body;

      if (
        !name ||
        !email ||
        !phone ||
        !password ||
        !confirmPassword
      ) {
        throw new ApiError(
          400,
          'All fields are required'
        );
      }

      if (
        password !==
        confirmPassword
      ) {
        throw new ApiError(
          400,
          'Password and confirm password do not match'
        );
      }

      const normalizedEmail =
        String(
          email
        )
          .trim()
          .toLowerCase();

      const normalizedPhone =
        String(
          phone
        ).trim();

      const existing =
        await User.findOne({
          $or: [
            {
              email:
                normalizedEmail,
            },

            {
              phone:
                normalizedPhone,
            },
          ],
        });

      if (existing) {
        throw new ApiError(
          409,
          'An account with this email or phone already exists'
        );
      }

      const user =
        await User.create({
          name:
            String(
              name
            ).trim(),

          email:
            normalizedEmail,

          phone:
            normalizedPhone,

          password,

          role:
            'customer',
        });

      const token =
        sendTokenResponse(
          res,
          user._id.toString(),
          user.role
        );

      sendSuccess(
        res,
        201,
        'Registered successfully',
        {
          user:
            toPublicUser(
              user
            ),

          token,
        }
      );
    }
  );

/* ============================================================
   LOGIN
============================================================ */

export const login =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const {
        email,
        phone,
        password,
      } =
        req.body;

      if (
        (!email &&
          !phone) ||
        !password
      ) {
        throw new ApiError(
          400,
          'Email or phone, and password are required'
        );
      }

      const query =
        email
          ? {
              email:
                String(
                  email
                )
                  .trim()
                  .toLowerCase(),
            }
          : {
              phone:
                String(
                  phone
                ).trim(),
            };

      const user =
        await User.findOne(
          query
        ).select(
          '+password'
        );

      if (
        !user ||
        !(await user.comparePassword(
          password
        ))
      ) {
        throw new ApiError(
          401,
          'Invalid credentials'
        );
      }

      if (
        !user.isActive
      ) {
        throw new ApiError(
          403,
          'This account has been deactivated. Contact support.'
        );
      }

      const token =
        sendTokenResponse(
          res,
          user._id.toString(),
          user.role
        );

      sendSuccess(
        res,
        200,
        'Logged in successfully',
        {
          user:
            toPublicUser(
              user
            ),

          token,
        }
      );
    }
  );

/* ============================================================
   LOGOUT
============================================================ */

export const logout =
  asyncHandler(
    async (
      _req: AuthRequest,
      res: Response
    ): Promise<void> => {
      res.cookie(
        'token',
        'none',
        {
          httpOnly: true,

          expires:
            new Date(
              Date.now() +
                1000
            ),
        }
      );

      sendSuccess(
        res,
        200,
        'Logged out successfully'
      );
    }
  );

/* ============================================================
   GET CURRENT USER
============================================================ */

export const getMe =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const user =
        await User.findById(
          req.user!.id
        );

      if (!user) {
        throw new ApiError(
          404,
          'User not found'
        );
      }

      sendSuccess(
        res,
        200,
        'Current user retrieved successfully',
        {
          user:
            toPublicUser(
              user
            ),
        }
      );
    }
  );

/* ============================================================
   UPDATE PROFILE + CLOUDINARY AVATAR

   PUT /api/auth/profile
============================================================ */

export const updateProfile =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const {
        name,
        phone,
      } =
        req.body;

      const user =
        await User.findById(
          req.user!.id
        );

      if (!user) {
        throw new ApiError(
          404,
          'User not found'
        );
      }

      /* ======================================================
         NAME
      ====================================================== */

      if (
        name !==
        undefined
      ) {
        const cleanName =
          String(
            name
          ).trim();

        if (!cleanName) {
          throw new ApiError(
            400,
            'Name cannot be empty'
          );
        }

        user.name =
          cleanName;
      }

      /* ======================================================
         PHONE
      ====================================================== */

      if (
        phone !==
        undefined
      ) {
        const cleanPhone =
          String(
            phone
          ).trim();

        if (!cleanPhone) {
          throw new ApiError(
            400,
            'Phone number cannot be empty'
          );
        }

        if (
          cleanPhone !==
          user.phone
        ) {
          const phoneTaken =
            await User.findOne({
              phone:
                cleanPhone,

              _id: {
                $ne:
                  user._id,
              },
            });

          if (phoneTaken) {
            throw new ApiError(
              409,
              'Phone number already in use'
            );
          }

          user.phone =
            cleanPhone;
        }
      }

      /* ======================================================
         AVATAR
      ====================================================== */

      if (req.file) {
        try {
          const avatarUrl =
            await uploadAvatarToCloudinary(
              req.file,

              String(
                user._id
              )
            );

          /*
           * Store the permanent HTTPS Cloudinary URL
           * in MongoDB.
           *
           * Example:
           *
           * https://res.cloudinary.com/.../user-123.webp
           */
          user.avatar =
            avatarUrl;
        } catch (error) {
          console.error(
            'Cloudinary avatar upload failed:',
            error
          );

          throw new ApiError(
            500,
            'Unable to upload profile picture. Please try again.'
          );
        }
      }

      /* ======================================================
         SAVE
      ====================================================== */

      await user.save();

      sendSuccess(
        res,
        200,
        'Profile updated successfully',
        {
          user:
            toPublicUser(
              user
            ),
        }
      );
    }
  );

/* ============================================================
   CHANGE PASSWORD
============================================================ */

export const changePassword =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const {
        currentPassword,
        newPassword,
        confirmNewPassword,
      } =
        req.body;

      if (
        !currentPassword ||
        !newPassword ||
        !confirmNewPassword
      ) {
        throw new ApiError(
          400,
          'All fields are required'
        );
      }

      if (
        newPassword !==
        confirmNewPassword
      ) {
        throw new ApiError(
          400,
          'New password and confirmation do not match'
        );
      }

      if (
        newPassword.length <
        8
      ) {
        throw new ApiError(
          400,
          'New password must be at least 8 characters'
        );
      }

      const user =
        await User.findById(
          req.user!.id
        ).select(
          '+password'
        );

      if (!user) {
        throw new ApiError(
          404,
          'User not found'
        );
      }

      if (
        !(await user.comparePassword(
          currentPassword
        ))
      ) {
        throw new ApiError(
          401,
          'Current password is incorrect'
        );
      }

      user.password =
        newPassword;

      await user.save();

      sendSuccess(
        res,
        200,
        'Password changed successfully'
      );
    }
  );

/* ============================================================
   FORGOT PASSWORD
============================================================ */

export const forgotPassword =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const {
        email,
      } =
        req.body;

      if (!email) {
        throw new ApiError(
          400,
          'Email is required'
        );
      }

      const normalizedEmail =
        String(
          email
        )
          .trim()
          .toLowerCase();

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        });

      /*
       * Use the same response when an account does not
       * exist so the endpoint does not reveal registered
       * email addresses.
       */
      const successMessage =
        'If an account with that email exists, a password reset link has been sent';

      if (!user) {
        sendSuccess(
          res,
          200,
          successMessage
        );

        return;
      }

      const resetToken =
        user.createPasswordResetToken();

      await user.save({
        validateBeforeSave:
          false,
      });

      const frontendUrl =
        (
          process.env
            .FRONTEND_URL ||
          'http://localhost:5173'
        ).replace(
          /\/$/,
          ''
        );

      const resetUrl =
        `${frontendUrl}/reset-password/${resetToken}`;

      try {
        await sendEmail({
          to:
            user.email,

          subject:
            'Reset your ShopNepal password',

          text: `
Hello ${user.name},

We received a request to reset the password for your ShopNepal account.

Open this link to create a new password:

${resetUrl}

If you did not request this password reset, you can ignore this email.

ShopNepal
          `.trim(),

          html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Reset your ShopNepal password</title>
</head>

<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">

<div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">

<div style="background:#dc2626;padding:26px;text-align:center;">

<h1 style="margin:0;color:#ffffff;font-size:28px;">
ShopNepal
</h1>

</div>

<div style="padding:32px;color:#27272a;">

<h2 style="margin-top:0;color:#18181b;">
Reset your password
</h2>

<p>
Hello ${user.name},
</p>

<p style="line-height:1.7;color:#52525b;">
We received a request to reset the password for your ShopNepal account.
</p>

<div style="text-align:center;margin:30px 0;">

<a
href="${resetUrl}"
style="display:inline-block;padding:14px 24px;background:#dc2626;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;"
>
Reset Password
</a>

</div>

<p style="color:#71717a;font-size:14px;">
If you did not request this password reset, you can safely ignore this email.
</p>

<p style="color:#71717a;font-size:12px;word-break:break-all;">
${resetUrl}
</p>

</div>

<div style="background:#fafafa;text-align:center;padding:18px;color:#a1a1aa;font-size:12px;">
ShopNepal &bull; Nepal
</div>

</div>

</body>
</html>
          `.trim(),
        });
      } catch (error) {
        /*
         * Remove the reset token when email delivery
         * fails so an unusable token is not left
         * active in the database.
         */

        user.passwordResetToken =
          undefined;

        user.passwordResetExpires =
          undefined;

        await user.save({
          validateBeforeSave:
            false,
        });

        console.error(
          'Password reset email failed:',
          error
        );

        throw new ApiError(
          500,
          'Unable to send password reset email. Please try again later.'
        );
      }

      sendSuccess(
        res,
        200,
        successMessage
      );
    }
  );

/* ============================================================
   RESET PASSWORD
============================================================ */

export const resetPassword =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ): Promise<void> => {
      const {
        token,
      } =
        req.params;

      const {
        password,
        confirmPassword,
      } =
        req.body;

      if (
        !password ||
        !confirmPassword
      ) {
        throw new ApiError(
          400,
          'Password and confirm password are required'
        );
      }

      if (
        password !==
        confirmPassword
      ) {
        throw new ApiError(
          400,
          'Passwords do not match'
        );
      }

      if (
        password.length <
        8
      ) {
        throw new ApiError(
          400,
          'Password must be at least 8 characters'
        );
      }

      const hashedToken =
        crypto
          .createHash(
            'sha256'
          )
          .update(
            token
          )
          .digest(
            'hex'
          );

      const user =
        await User.findOne({
          passwordResetToken:
            hashedToken,

          passwordResetExpires:
            {
              $gt:
                new Date(),
            },
        }).select(
          '+password +passwordResetToken +passwordResetExpires'
        );

      if (!user) {
        throw new ApiError(
          400,
          'Reset token is invalid or has expired'
        );
      }

      user.password =
        password;

      /*
       * A reset link must only work once.
       */
      user.passwordResetToken =
        undefined;

      user.passwordResetExpires =
        undefined;

      await user.save();

      const jwtToken =
        sendTokenResponse(
          res,
          user._id.toString(),
          user.role
        );

      sendSuccess(
        res,
        200,
        'Password reset successfully',
        {
          token:
            jwtToken,
        }
      );
    }
  );