import { db } from '../application/database';
import { convertToPercentageString } from '../utils/math';
import { timeFormatter } from '../utils/time';
import { CraftResponse } from './craft.model';

// Database document schema
export type Prediction = {
  id: string;
  userId: string;
  materialImage: string;
  result: string;
  percentage: number;
  createdAt: string;
};

// Response schema
export type PredictionResponse = {
  result: string;
  percentage: string;
  crafts: CraftResponse[];
};

/* History */
export type PredictionHistoryResponse = {
  id: string;
  materialImage: string;
  result: string;
  percentage: string;
  crafts: CraftResponse[];
}

export type PredictionHistoryListResponse = {
  id: string;
  result: string;
  createdAt: string;
};

// Response function
export function toPredictionResponse(
  prediction: Prediction,
  crafts: CraftResponse[]
): PredictionResponse {
  return {
    result: prediction.result,
    percentage: convertToPercentageString(prediction.percentage),
    crafts: crafts,
  };
}

export function toPredictionHistoryResponse(
  prediction: Prediction,
  crafts: CraftResponse[]
): PredictionHistoryResponse {
  return {
    id: prediction.id,
    materialImage: prediction.materialImage,
    result: prediction.result,
    percentage: convertToPercentageString(prediction.percentage),
    crafts: crafts,
  };
}

export function toPredictionHistoryListResponse(
  prediction: Prediction
): PredictionHistoryListResponse {
  const formattedDate = timeFormatter.format(new Date(prediction.createdAt));

  return {
    id: prediction.id,
    result: prediction.result,
    createdAt: formattedDate,
  };
}

export const predictionsRef = db.collection('predictions');
