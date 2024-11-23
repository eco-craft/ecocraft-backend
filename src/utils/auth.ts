import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { CustomJWTPayload } from '../types/custom';

export const random = () => crypto.randomBytes(128).toString('base64');

export const hash = (salt: string, password: string) => {
  const SECRET = process.env.SECRET;

  return crypto
    .createHmac('sha256', [salt, password].join('/'))
    .update(SECRET)
    .digest('hex');
};

export const generateAccessToken = (payload: CustomJWTPayload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
  });
};

export const generateRefreshToken = (payload: CustomJWTPayload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });
};

export const verifyAccessToken = (
  accessToken: string
): CustomJWTPayload | 'EXPIRED' | 'INVALID' => {
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    ) as CustomJWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return 'EXPIRED';
    } else if (error) {
      return 'INVALID';
    }
  }
};

export const verifyRefreshToken = (
  refreshToken: string
): CustomJWTPayload | 'EXPIRED' | 'INVALID' => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    ) as CustomJWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return 'EXPIRED';
    } else if (error) {
      return 'INVALID';
    }
  }
};
