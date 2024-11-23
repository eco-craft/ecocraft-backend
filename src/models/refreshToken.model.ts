import { db } from '../application/database';

export interface RefreshToken {
  id: string;
  user: string;
  refreshToken: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
}

export const refreshTokensRef = db.collection('refreshTokens');
