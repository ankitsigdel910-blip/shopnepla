import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError';

export const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: 'path' in e ? (e as any).path : undefined,
      message: e.msg,
    }));
    throw new ApiError(400, 'Validation failed', formatted);
  }
  next();
};
