import { Firestore } from '@google-cloud/firestore';

export const db =
  process.env.APP_ENV === 'production'
    ? new Firestore({ // Uses default credentials in production (e.g., Cloud Run service account)
      GOOGLE_FIRESTORE_DATABASE_ID: process.env.GOOGLE_FIRESTORE_DATABASE_ID,
    })
    : new Firestore({
        GOOGLE_FIRESTORE_DATABASE_ID: process.env.GOOGLE_FIRESTORE_DATABASE_ID,
        keyFilename: './config/service-account-key.json', // Uses service account key in development
      });
