import { Bucket, Storage } from '@google-cloud/storage';

const storage =
  process.env.APP_ENV === 'production'
    ? new Storage()
    : new Storage({
        keyFilename: './config/service-account-key.json',
      });

export const bucketName: string = process.env.GOOGLE_STORAGE_BUCKET

export const bucket: Bucket = storage.bucket(bucketName);