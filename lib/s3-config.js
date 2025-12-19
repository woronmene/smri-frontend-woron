import { S3Client } from '@aws-sdk/client-s3';

// AWS S3 Configuration
const s3Config = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
};

// Create S3 client instance
export const s3Client = new S3Client(s3Config);

// S3 Bucket name
export const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;

// S3 folder structure
export const S3_FOLDERS = {
  COURSE_THUMBNAILS: 'courses/thumbnails',
  LESSON_VIDEOS: 'lessons/videos',
  LESSON_IMAGES: 'lessons/images',
};
