import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

import ApiError from '../utils/ApiError';

// ============================================================
// UPLOAD DIRECTORIES
// ============================================================

const productDirectory =
  path.resolve(
    process.cwd(),
    'uploads',
    'products'
  );

const categoryDirectory =
  path.resolve(
    process.cwd(),
    'uploads',
    'categories'
  );

// Automatically create both folders.
fs.mkdirSync(
  productDirectory,
  {
    recursive: true,
  }
);

fs.mkdirSync(
  categoryDirectory,
  {
    recursive: true,
  }
);

// ============================================================
// SAFE FILE NAME
// ============================================================

const createFileName = (
  originalName: string
): string => {
  const extension =
    path
      .extname(
        originalName
      )
      .toLowerCase();

  const originalBaseName =
    path.basename(
      originalName,
      extension
    );

  const safeBaseName =
    originalBaseName
      .replace(
        /[^a-zA-Z0-9-_]/g,
        '-'
      )
      .replace(
        /-+/g,
        '-'
      )
      .slice(
        0,
        60
      );

  const unique =
    `${Date.now()}-${crypto
      .randomBytes(4)
      .toString('hex')}`;

  return `${unique}-${safeBaseName}${extension}`;
};

// ============================================================
// FILE FILTER
// ============================================================

const allowedMimeTypes =
  new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);

const fileFilter:
  multer.Options['fileFilter'] =
  (
    _req,
    file,
    cb
  ) => {
    if (
      allowedMimeTypes.has(
        file.mimetype
      )
    ) {
      cb(
        null,
        true
      );

      return;
    }

    cb(
      new ApiError(
        400,
        'Only JPG, PNG and WebP image files are allowed'
      ) as any,
      false
    );
  };

// ============================================================
// PRODUCT STORAGE
// ============================================================

const productStorage =
  multer.diskStorage({
    destination: (
      _req,
      _file,
      cb
    ) => {
      cb(
        null,
        productDirectory
      );
    },

    filename: (
      _req,
      file,
      cb
    ) => {
      cb(
        null,
        createFileName(
          file.originalname
        )
      );
    },
  });

// ============================================================
// CATEGORY STORAGE
// ============================================================

const categoryStorage =
  multer.diskStorage({
    destination: (
      _req,
      _file,
      cb
    ) => {
      cb(
        null,
        categoryDirectory
      );
    },

    filename: (
      _req,
      file,
      cb
    ) => {
      cb(
        null,
        createFileName(
          file.originalname
        )
      );
    },
  });

// ============================================================
// PRODUCT UPLOAD
// ============================================================

const upload = multer({
  storage:
    productStorage,

  fileFilter,

  limits: {
    fileSize:
      5 *
      1024 *
      1024,

    files: 8,
  },
});

// ============================================================
// CATEGORY UPLOAD
// ============================================================

export const categoryUpload =
  multer({
    storage:
      categoryStorage,

    fileFilter,

    limits: {
      fileSize:
        5 *
        1024 *
        1024,

      files: 1,
    },
  });

// Default uploader = products.
export default upload;