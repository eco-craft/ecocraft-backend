import { db } from '../application/database';

// Database document schema
export type RefreshToken = {
  id: string;
  userId: string;
  refreshToken: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
}

// Response schema
export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
}

export const refreshTokensRef = db.collection('refreshTokens');
