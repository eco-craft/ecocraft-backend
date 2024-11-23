import { ResponseError } from '../error/response-error';
import { usersRef, User } from '../models/user.model';
import { refreshTokensRef, RefreshToken } from '../models/refreshToken.model';
import { CustomJWTPayload } from '../types/custom';
import {
  generateAccessToken,
  generateRefreshToken,
  hash,
  random,
  verifyRefreshToken,
} from '../utils/auth';
import {
  DeleteUserValidation,
  GetCurrentUserValidation,
  GetUserValidation,
  LoginUserValidation,
  RefreshTokenValidation,
  RegisterUserValidation,
  UpdateUserValidation,
} from '../validation/user.validation';
import { validate } from '../validation/validation';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../application/database';

const register = async (data: Record<string, any>) => {
  const user = validate(RegisterUserValidation, data);

  if (user.password !== user.passwordConfirmation) {
    throw new ResponseError(400, 'Password and confirm password do not match.');
  }

  const existingUser = await usersRef
    .where('email', '==', user.email)
    .limit(1)
    .get();

  if (!existingUser.empty) {
    throw new ResponseError(400, 'Email already registered.');
  }

  const newSalt = random();
  const newId = createId();

  const newUserData: User = {
    id: newId,
    name: user.name,
    email: user.email,
    password: hash(newSalt, user.password),
    salt: newSalt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Store in database
  await usersRef.doc(newId).set(newUserData);

  // Return user data without password and salt
  const { password, salt, ...rest } = newUserData;

  const userData: Omit<User, 'password' | 'salt'> = rest;

  return userData;
};

const login = async (data: Record<string, any>, userAgent?: string) => {
  const loginRequest = validate(LoginUserValidation, data);

  const snapshot = await usersRef
    .where('email', '==', loginRequest.email)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new ResponseError(401, 'Email or password is wrong.');
  }

  const user = snapshot.docs[0].data() as User;

  const passwordHash = hash(user.salt, loginRequest.password);

  if (passwordHash !== user.password) {
    throw new ResponseError(401, 'Email or password is wrong.');
  }

  // Generate JWT
  const payload: CustomJWTPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token
  const newId = createId();

  const newRefreshToken: RefreshToken = {
    id: newId,
    user: user.id,
    refreshToken: refreshToken,
    userAgent: userAgent,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await refreshTokensRef.doc(newId).set(newRefreshToken);

  const token = {
    accessToken,
    refreshToken,
  };

  return token;
};

const getCurrent = async (data: Record<string, any>) => {
  const userId = validate(GetCurrentUserValidation, data).userId;

  const userDoc = await usersRef.doc(userId).get();

  if (!userDoc.exists) {
    throw new ResponseError(404, 'User not found.');
  }

  const userData: Omit<User, 'password' | 'salt'> = {
    id: userDoc.data().id,
    name: userDoc.data().name,
    email: userDoc.data().email,
    createdAt: userDoc.data().createdAt,
    updatedAt: userDoc.data().updatedAt,
  };

  return userData;
};

const get = async (data: Record<string, any>) => {
  const userId = validate(GetUserValidation, data).userId;

  const userDoc = await usersRef.doc(userId).get();

  if (!userDoc.exists) {
    throw new ResponseError(404, 'User not found.');
  }

  const userData: Omit<User, 'password' | 'salt'> = {
    id: userDoc.data().id,
    name: userDoc.data().name,
    email: userDoc.data().email,
    createdAt: userDoc.data().createdAt,
    updatedAt: userDoc.data().updatedAt,
  };

  return userData;
};

const list = async () => {
  const users = await usersRef
    .select('id', 'name', 'email', 'createdAt', 'updatedAt')
    .get();

  if (users.empty) {
    return [];
  }

  const userList: Array<Omit<User, 'password' | 'salt'>> = users.docs.map(
    (doc) => ({
      id: doc.data().id,
      name: doc.data().name,
      email: doc.data().email,
      createdAt: doc.data().createdAt,
      updatedAt: doc.data().updatedAt,
    })
  );

  return userList;
};

const updateCurrent = async (data: Record<string, any>) => {
  const validatedData = validate(UpdateUserValidation, data);

  const currentUserDoc = await usersRef.doc(validatedData.id).get();
  if (!currentUserDoc.exists) {
    throw new ResponseError(404, 'User not found.');
  }
  const currentUserData = currentUserDoc.data() as User;

  type UserDataInput = {
    name?: string;
    email?: string;
    password?: string;
    salt?: string;
  };

  const newUserData: UserDataInput = {};

  if (validatedData.name) {
    newUserData.name = validatedData.name;
  }

  if (validatedData.email) {
    // Check if email is already taken by another user
    const emailExists = await usersRef
      .where('email', '==', validatedData.email)
      .get();

    if (!emailExists.empty) {
      throw new ResponseError(400, 'Email already registered.');
    } else {
      newUserData.email = validatedData.email;
    }
  }

  if (validatedData.password) {
    if (validatedData.password !== validatedData.passwordConfirmation) {
      throw new ResponseError(
        400,
        'Password and confirm password do not match.'
      );
    }

    const currentPasswordHash = hash(
      currentUserData.salt,
      validatedData.currentPassword
    );

    if (currentPasswordHash !== currentUserData.password) {
      throw new ResponseError(400, 'Wrong password.');
    }

    const salt = random();

    newUserData.password = hash(salt, validatedData.password);
    newUserData.salt = salt;
  }

  await usersRef
    .doc(validatedData.id)
    .update({ ...newUserData, updatedAt: new Date().toISOString() });

  const updatedUserDoc = await usersRef.doc(validatedData.id).get();

  const updatedUserData: Omit<User, 'password' | 'salt'> = {
    id: updatedUserDoc.data().id,
    name: updatedUserDoc.data().name,
    email: updatedUserDoc.data().email,
    createdAt: updatedUserDoc.data().createdAt,
    updatedAt: updatedUserDoc.data().updatedAt,
  };

  return updatedUserData;
};

const logout = async (data: Record<string, any>) => {
  const validatedData = validate(RefreshTokenValidation, data);
  const refreshToken = validatedData.refreshToken;

  const existingRefreshTokenDoc = await refreshTokensRef
    .where('refreshToken', '==', refreshToken)
    .limit(1)
    .get();

  if (existingRefreshTokenDoc.empty) {
    throw new ResponseError(401, 'Invalid refresh token.');
  }

  // Delete refresh token
  const existingRefreshToken =
    existingRefreshTokenDoc.docs[0].data() as RefreshToken;
  await refreshTokensRef.doc(existingRefreshToken.id).delete();

  const token = {
    accessToken: '',
    refreshToken: '',
  };

  return token;
};

const removeCurrent = async (data: Record<string, any>) => {
  const userId = validate(DeleteUserValidation, data).userId;

  // Delete all refresh tokens
  const snapshot = await refreshTokensRef.where('user', '==', userId).get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Delete user
  await usersRef.doc(userId).delete();

  const token = {
    accessToken: '',
    refreshToken: '',
  };

  return token;
};

const getNewAccessToken = async (data: Record<string, any>) => {
  const refreshToken = validate(RefreshTokenValidation, data).refreshToken;

  // Check if refresh token exists in database
  const existingRefreshTokenDoc = await refreshTokensRef
    .where('refreshToken', '==', refreshToken)
    .limit(1)
    .get();

  if (existingRefreshTokenDoc.empty) {
    throw new ResponseError(401, 'Invalid refresh token.');
  }

  const existingRefreshToken =
    existingRefreshTokenDoc.docs[0].data() as RefreshToken;

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  if (decoded == 'EXPIRED') {
    // Delete refresh token
    await refreshTokensRef.doc(existingRefreshToken.id).delete();

    throw new ResponseError(401, 'Refresh token expired. Please login again.');
  } else if (decoded == 'INVALID') {
    throw new ResponseError(401, 'Invalid refresh token.');
  }

  // Generate new access token
  const payload: CustomJWTPayload = {
    id: decoded.id,
    email: decoded.email,
    name: decoded.name,
  };

  const accessToken = generateAccessToken(payload);

  return { accessToken };
};

export default {
  register,
  login,
  getCurrent,
  get,
  list,
  updateCurrent,
  logout,
  removeCurrent,
  getNewAccessToken,
};
