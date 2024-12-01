import { init } from '@paralleldrive/cuid2';
import { logger } from '../application/logging';
import { bucket, bucketName } from '../application/storage';

// Function to save image from multer file to disk
export const saveImageToGCS = async (
  folderName: string,
  file: Express.Multer.File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Generate new file name
    const createId = init({
      length: 8,
    });
    const { fileName, fileExtension } = separateFilename(file.originalname);

    const newFileName =
      folderName +
      '/' +
      fileName.replace(/ /g, '_') +
      '_' +
      createId() +
      '.' +
      fileExtension;

    const blob = bucket.file(newFileName);
    const blobStream = blob.createWriteStream({
      resumable: true,
      contentType: file.mimetype,
    });

    // Handle errors
    blobStream.on('error', (err) => {
      logger.error('Blob stream error:', err);
      reject(err); // Reject the Promise on error
    });

    // Handle success
    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${newFileName}`;
      resolve(publicUrl); // Resolve the Promise with the URL
    });

    blobStream.end(file.buffer); // End the stream
  });
};

export const deleteImageFromPublicUrl = async (publicUrl: string): Promise<void> => {
  /**
   * Extract the path from the public URL
   * 
   * Example:
   * publicUrl = 'https://storage.googleapis.com/bucket-name/crafts/290975_g3oxzdch.jpg'
   * path = 'crafts/290975_g3oxzdch.jpg'
   * 
   * The path is the part of the URL after 'ecocraft-storage/'
   * We will use this path to delete the file from the storage
   */

  const path = publicUrl.split(`/${bucketName}/`)[1];

  const file = bucket.file(path);

  await file.delete();
}

const separateFilename = (file: string) => {
  const lastDotIndex = file.lastIndexOf('.');
  if (lastDotIndex === -1) {
    // No dot found, return the whole filename as the name with no extension
    return { name: file, extension: '' };
  }
  const fileName = file.substring(0, lastDotIndex); // Everything before the last dot
  const fileExtension = file.substring(lastDotIndex + 1); // Everything after the last dot
  return { fileName, fileExtension };
};
