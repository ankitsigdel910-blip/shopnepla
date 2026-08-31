import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import { UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
const COOKIE_DAYS = Number(process.env.JWT_COOKIE_EXPIRES_DAYS || 7);

export const signToken = (id: string, role: UserRole): string => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Signs a JWT and sends it both in the JSON body and as an httpOnly cookie.
 * Using an httpOnly cookie protects the token from XSS; the frontend can
 * additionally keep the token in memory (Redux) for Authorization headers.
 */
export const sendTokenResponse = (
  res: Response,
  id: string,
  role: UserRole
): string => {
  const token = signToken(id, role);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000),
  });

  return token;
};
