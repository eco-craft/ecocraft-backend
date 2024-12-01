import { createId } from '@paralleldrive/cuid2';
import { ResponseError } from '../error/response-error';
import {
  Craft,
  CraftResponse,
  craftsRef,
  CreateCraftRequest,
  ListCraftRequest,
  toCraftResponse,
  UpdateCraftRequest,
} from '../models/craft.model';
import { CraftValidation } from '../validation/craft.validation';
import { UserJWTPayload } from '../models/user.model';
import { Validation } from '../validation/validation';
import { UserService } from './user.service';
import { deleteImageFromPublicUrl, saveImageToGCS } from '../utils/storage';

export class CraftService {
  static async create(
    user: UserJWTPayload,
    request: CreateCraftRequest,
    fileRequest: Express.Multer.File
  ): Promise<CraftResponse> {
    const validatedData = Validation.validate(CraftValidation.CREATE, request);

    if (!fileRequest) {
      throw new ResponseError(400, 'Craft image is required.');
    }

    Validation.validate(CraftValidation.IMAGE, fileRequest);

    // Save image to storage
    const imagePath = await saveImageToGCS('crafts', fileRequest);

    const newId = createId();

    const newCraft: Craft = {
      id: newId,
      title: validatedData.title,
      image: imagePath,
      materials: validatedData.materials,
      steps: validatedData.steps,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in database
    await craftsRef.doc(newId).set(newCraft);

    // Get user data from user service
    const userData = await UserService.get(user.id);

    return toCraftResponse(newCraft, userData);
  }

  static async list(request: ListCraftRequest): Promise<CraftResponse[]> {
    const validatedData = Validation.validate(CraftValidation.LIST, request);

    const Fuse = (await import('fuse.js')).default;

    const snapshot = await craftsRef.get();
    let crafts: Craft[] = snapshot.docs.map((doc) => ({
      ...doc.data(),
    })) as Craft[];

    if (validatedData.title) {
      const fuse = new Fuse(crafts, { keys: ['title'], includeScore: true });
      crafts = fuse.search(validatedData.title).map((result) => result.item);
    }

    const craftsResponse: CraftResponse[] = await Promise.all(
      crafts.map(async (craft) => {
        // Query user for each craft
        const userData = await UserService.get(craft.userId);

        return toCraftResponse(craft, userData);
      })
    );

    return craftsResponse;
  }

  static async get(craftId: string): Promise<CraftResponse> {
    const craftDoc = await craftsRef.doc(craftId).get();

    if (!craftDoc.exists) {
      throw new ResponseError(404, 'Craft idea not found.');
    }

    // Get user data from user service
    const userData = await UserService.get(craftDoc.data().userId);

    return toCraftResponse(craftDoc.data() as Craft, userData);
  }

  static async update(
    user: UserJWTPayload,
    request: UpdateCraftRequest,
    fileRequest: Express.Multer.File
  ): Promise<CraftResponse> {
    const validatedData: UpdateCraftRequest & {
      image?: string;
      updatedAt?: string;
    } = Validation.validate(CraftValidation.UPDATE, request);

    const doc = await craftsRef.doc(validatedData.id).get();
    if (!doc.exists) {
      throw new ResponseError(404, 'Craft idea not found.');
    }
    const craft = doc.data() as Craft;

    // Check if user is the owner of the craft idea
    if (craft.userId !== user.id) {
      throw new ResponseError(403, 'Unauthorized to update this craft idea.');
    }

    // Check if there is an image to update
    if (fileRequest) {
      Validation.validate(CraftValidation.IMAGE, fileRequest);

      // Delete old image from storage
      if (craft.image) {
        await deleteImageFromPublicUrl(craft.image);
      }

      // Save image to storage
      validatedData.image = await saveImageToGCS('crafts', fileRequest);
    }

    validatedData.updatedAt = new Date().toISOString();

    await craftsRef.doc(validatedData.id).update(validatedData);

    const updatedCraft = (await craftsRef.doc(validatedData.id).get()).data() as Craft;

    // Get user data from user service
    const userData = await UserService.get(updatedCraft.userId);

    return toCraftResponse(updatedCraft, userData);
  }

  static async remove(
    user: UserJWTPayload,
    craftId: string
  ): Promise<CraftResponse> {

    const doc = await craftsRef.doc(craftId).get();
    if (!doc.exists) {
      throw new ResponseError(404, 'Craft idea not found.');
    }
    const craft = doc.data() as Craft;

    // Check if user is the owner of the craft idea
    if (craft.userId !== user.id) {
      throw new ResponseError(403, 'Unauthorized to delete this craft idea.');
    }

    // Delete image from storage
    if (craft.image) {
      await deleteImageFromPublicUrl(craft.image);
    }

    // Delete from database
    await craftsRef.doc(craft.id).delete();

    const userData = await UserService.get(user.id);

    return toCraftResponse(craft, userData);
  }
}
