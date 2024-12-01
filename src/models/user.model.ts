import { db } from '../application/database';

// Database document schema
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  photo?: string;
  /* 
    password and salt are optional because the 
    user may have signed up with a third-party service.
  */
  password?: string;
  salt?: string;
  createdAt: string;
  updatedAt: string;
}

// JWT payload
export type UserJWTPayload = {
  id: string;
  name: string;
  email: string;
};

// API response
export type UserResponse = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  photo: string;
}

// Request schema
export type RegisterUserRequest = {
  name: string;
  email: string;
  password: string;
}

export type LoginUserRequest = {
  email: string;
  password: string;
}

export type UpdateUserRequest = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  currentPassword?: string;
  password?: string;
  passwordConfirmation?: string;
}

export type LogoutUserRequest = {
  refreshToken: string;
}

export type GetNewAccessTokenRequest = {
  refreshToken: string;
}

// Response function
export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    photo: user.photo || `https://robohash.org/${user.id}?set=set4`,
  };
}

// Database reference Firestore
export const usersRef = db.collection('users');
