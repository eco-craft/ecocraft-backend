import { Readable } from 'stream';
import axios from 'axios';
import FormData from 'form-data';
import { UserJWTPayload } from '../models/user.model';
import {
  Prediction,
  PredictionHistoryListResponse,
  PredictionHistoryResponse,
  PredictionResponse,
  predictionsRef,
  toPredictionHistoryListResponse,
  toPredictionHistoryResponse,
  toPredictionResponse,
} from '../models/prediction.model';
import { ResponseError } from '../error/response-error';
import { Validation } from '../validation/validation';
import { PredictionValidation } from '../validation/prediction.validation';
import {
  Craft,
  CraftResponse,
  craftsRef,
  toCraftResponse,
} from '../models/craft.model';
import { UserService } from './user.service';
import { saveImageToGCS } from '../utils/storage';
import { createId } from '@paralleldrive/cuid2';
import { convertToPercentageString } from '../utils/math';

export class PredictionService {
  static async predict(
    user: UserJWTPayload,
    fileRequest: Express.Multer.File
  ): Promise<PredictionResponse> {
    // Validate image
    if (!fileRequest) {
      throw new ResponseError(400, 'Image is required.');
    }
    Validation.validate(PredictionValidation.IMAGE, fileRequest);

    // Conver buffer to a readable stream
    const readableStream = new Readable();
    readableStream.push(fileRequest.buffer);
    readableStream.push(null);

    // Create form data
    const formData = new FormData();
    formData.append('file', readableStream, fileRequest.originalname);

    // Send to ML api
    const response = await axios.post(
      process.env.ML_URL + '/predict',
      formData
    );

    // Extract the prediction result
    const data = response.data;
    let materialPredicted: string = Object.keys(data.predictions)[0];
    let confidence: number = data.predictions[materialPredicted];

    // If no material found
    if (materialPredicted == 'error') {
      materialPredicted = 'No material found.';
      confidence = 0;

      const response: PredictionResponse = {
        result: materialPredicted,
        percentage: convertToPercentageString(confidence),
        crafts: [],
      };

      return response;
    }

    // Save material image to storage
    const imagePath: string = await saveImageToGCS('predictions', fileRequest);

    // Store in database
    const newId = createId();
    const newPrediction: Prediction = {
      id: newId,
      userId: user.id,
      materialImage: imagePath,
      result: materialPredicted,
      percentage: confidence,
      createdAt: new Date().toISOString(),
    };
    await predictionsRef.doc(newId).set(newPrediction);

    // Filter crafts
    const snapshot = await craftsRef
      .where('materials', 'array-contains', materialPredicted.toLowerCase())
      .get();

    let craftsResponse: CraftResponse[];
    if (snapshot.empty) {
      craftsResponse = [];
    } else {
      craftsResponse = await Promise.all(
        snapshot.docs.map(async (doc) => {
          let craft = doc.data() as Craft;
          // Query user for each craft
          const userData = await UserService.get(craft.userId);

          return toCraftResponse(craft, userData);
        })
      );
    }

    // Return the result
    return toPredictionResponse(newPrediction, craftsResponse);
  }

  static async list(
    user: UserJWTPayload
  ): Promise<PredictionHistoryListResponse[]> {
    const snapshot = await predictionsRef
      .where('userId', '==', user.id)
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => {
      return toPredictionHistoryListResponse(doc.data() as Prediction);
    });
  }

  static async get(
    user: UserJWTPayload,
    predictionId: string
  ): Promise<PredictionHistoryResponse> {
    const predictionDoc = await predictionsRef.doc(predictionId).get();

    if (!predictionDoc.exists) {
      throw new ResponseError(404, 'Prediction not found.');
    }

    const prediction = predictionDoc.data() as Prediction;

    // Check if user is owner
    if (prediction.userId !== user.id) {
      throw new ResponseError(403, 'Forbidden.');
    }

    // Filter crafts
    const snapshot = await craftsRef
      .where('materials', 'array-contains', prediction.result.toLowerCase())
      .get();

    let craftsResponse: CraftResponse[];
    if (snapshot.empty) {
      craftsResponse = [];
    } else {
      craftsResponse = await Promise.all(
        snapshot.docs.map(async (doc) => {
          let craft = doc.data() as Craft;
          // Query user for each craft
          const userData = await UserService.get(craft.userId);

          return toCraftResponse(craft, userData);
        })
      );
    }

    return toPredictionHistoryResponse(prediction, craftsResponse);
  }
}
