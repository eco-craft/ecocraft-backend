import { db } from '../application/database';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string | null;
  salt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const usersRef = db.collection('users');
