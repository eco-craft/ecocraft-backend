import { ResponseError } from '../error/response-error';
import {
  usersRef,
  User,
  UpdateUserRequest,
  RegisterUserRequest,
  UserResponse,
  toUserResponse,
  LoginUserRequest,
  LogoutUserRequest,
  GetNewAccessTokenRequest,
} from '../models/user.model';
import {
  refreshTokensRef,
  RefreshToken,
  TokenResponse,
} from '../models/refreshToken.model';
import { UserJWTPayload } from '../models/user.model';
import {
  generateAccessToken,
  generateRefreshToken,
  hash,
  random,
  verifyRefreshToken,
} from '../utils/auth';
import { UserValidation } from '../validation/user.validation';
import { Validation } from '../validation/validation';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../application/database';
import { deleteImageFromPublicUrl, saveImageToGCS } from '../utils/storage';

export class UserService {
  static async register(request: RegisterUserRequest): Promise<UserResponse> {
    const validatedData = Validation.validate(UserValidation.REGISTER, request);

    const existingUser = await usersRef
      .where('email', '==', validatedData.email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      throw new ResponseError(400, 'Email already registered.');
    }

    const newSalt: string = random();
    const newId: string = createId();

    const newUserData: User = {
      id: newId,
      name: validatedData.name,
      email: validatedData.email,
      password: hash(newSalt, validatedData.password),
      salt: newSalt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in database
    await usersRef.doc(newId).set(newUserData);

    return toUserResponse(newUserData);
  }

  static async login(
    request: LoginUserRequest,
    userAgent?: string
  ): Promise<TokenResponse> {
    const validatedData = Validation.validate(UserValidation.LOGIN, request);

    const snapshot = await usersRef
      .where('email', '==', validatedData.email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new ResponseError(401, 'Email or password is wrong.');
    }

    const user = snapshot.docs[0].data() as User;

    // Check password
    const passwordHash = hash(user.salt, validatedData.password);

    if (passwordHash !== user.password) {
      throw new ResponseError(401, 'Email or password is wrong.');
    }

    // Generate JWT
    const payload: UserJWTPayload = {
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
      userId: user.id,
      refreshToken: refreshToken,
      userAgent: userAgent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await refreshTokensRef.doc(newId).set(newRefreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  static async getCurrent(user: UserJWTPayload): Promise<UserResponse> {
    const userDoc = await usersRef.doc(user.id).get();

    if (!userDoc.exists) {
      throw new ResponseError(404, 'User not found.');
    }

    return toUserResponse(userDoc.data() as User);
  }

  static async get(userId: string): Promise<UserResponse> {
    const userDoc = await usersRef.doc(userId).get();

    if (!userDoc.exists) {
      throw new ResponseError(404, 'User not found.');
    }

    return toUserResponse(userDoc.data() as User);
  }

  static async list(): Promise<Array<UserResponse>> {
    const users = await usersRef.get();

    if (users.empty) {
      return [];
    }

    return users.docs.map((doc) => toUserResponse(doc.data() as User));
  }

  static async updateCurrent(
    user: UserJWTPayload,
    request: UpdateUserRequest,
    fileRequest: Express.Multer.File
  ): Promise<UserResponse> {
    const validatedData: UpdateUserRequest & {
      salt?: string;
      photo?: string;
      updatedAt?: string;
    } = Validation.validate(UserValidation.UPDATE, request);

    // Check if user exists
    const currentUserDoc = await usersRef.doc(user.id).get();
    if (!currentUserDoc.exists) {
      throw new ResponseError(404, 'User not found.');
    }
    const currentUser = currentUserDoc.data() as User;

    // If changing email
    if (validatedData.email) {
      // Check if email is already taken by another user
      const emailExists = await usersRef
        .where('email', '==', validatedData.email)
        .get();

      if (!emailExists.empty) {
        throw new ResponseError(400, 'Email already registered.');
      }
    }

    // If changing password
    if (
      validatedData.password ||
      validatedData.currentPassword ||
      validatedData.passwordConfirmation
    ) {
      if (validatedData.password !== validatedData.passwordConfirmation) {
        throw new ResponseError(
          400,
          'Password and confirm password do not match.'
        );
      }

      const currentPasswordHash = hash(
        currentUser.salt,
        validatedData.currentPassword
      );

      if (currentPasswordHash !== currentUser.password) {
        throw new ResponseError(400, 'Wrong password.');
      }

      const newSalt = random();
      validatedData.password = hash(newSalt, validatedData.password);
      validatedData.salt = newSalt;

      // Delete currentPassword and passwordConfirmation from validatedData
      delete validatedData.currentPassword;
      delete validatedData.passwordConfirmation;
    }

    // If changing profile picture
    if (fileRequest) {
      Validation.validate(UserValidation.IMAGE, fileRequest);

      // If user has existing photo, delete it
      if (currentUser.photo) {
        await deleteImageFromPublicUrl(currentUser.photo);
      }

      // Upload image to storage
      validatedData.photo = await saveImageToGCS('users', fileRequest);
    }

    // Update user data
    validatedData.updatedAt = new Date().toISOString();
    await usersRef.doc(user.id).update(validatedData);

    const updatedUserDoc = await usersRef.doc(user.id).get();

    return toUserResponse(updatedUserDoc.data() as User);
  }

  static async logout(request: LogoutUserRequest): Promise<TokenResponse> {
    const validatedData = Validation.validate(UserValidation.LOGOUT, request);
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

    return {
      accessToken: '',
      refreshToken: '',
    };
  }

  static async removeCurrent(user: UserJWTPayload): Promise<TokenResponse> {
    // Delete all refresh tokens
    const snapshot = await refreshTokensRef.where('user', '==', user.id).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete user photo if exists
    const currentUserDoc = await usersRef.doc(user.id).get();
    const currentUser = currentUserDoc.data() as User;
    if (currentUser.photo) {
      await deleteImageFromPublicUrl(currentUser.photo);
    }

    // Delete user
    await usersRef.doc(user.id).delete();

    return {
      accessToken: '',
      refreshToken: '',
    };
  }

  static async getNewAccessToken(
    request: GetNewAccessTokenRequest
  ): Promise<Omit<TokenResponse, 'refreshToken'>> {
    const validatedData = Validation.validate(
      UserValidation.GET_NEW_ACCESS_TOKEN,
      request
    );
    const refreshToken = validatedData.refreshToken;

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

      throw new ResponseError(
        401,
        'Refresh token expired. Please login again.'
      );
    } else if (decoded == 'INVALID') {
      throw new ResponseError(401, 'Invalid refresh token.');
    }

    // Generate new access token
    const payload: UserJWTPayload = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };

    const accessToken = generateAccessToken(payload);

    return {
      accessToken,
    };
  }
}
