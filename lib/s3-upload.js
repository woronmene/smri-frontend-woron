import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME, S3_FOLDERS } from './s3-config';

/**
 * Generate a unique filename with timestamp
 */
const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop();
  const nameWithoutExt = originalFilename.replace(`.${extension}`, '');
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  
  return `${sanitizedName}-${timestamp}-${randomString}.${extension}`;
};

/**
 * Upload file to S3
 * @param {File} file - The file to upload
 * @param {string} folder - S3 folder path (e.g., S3_FOLDERS.COURSE_THUMBNAILS)
 * @returns {Promise<{success: boolean, url?: string, key?: string, error?: string}>}
 */
export const uploadToS3 = async (file, folder) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Check if S3 is configured
    const isS3Configured = BUCKET_NAME && 
                          process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID && 
                          process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID !== 'your-aws-access-key-id';

    // Development mode: Generate mock URL if S3 not configured
    if (!isS3Configured) {
      console.warn('⚠️ S3 not configured. Using mock URL for development.');
      
      // Create a local object URL for preview
      const mockUrl = URL.createObjectURL(file);
      const filename = generateUniqueFilename(file.name);
      
      return {
        success: true,
        url: mockUrl,
        key: `${folder}/${filename}`,
        isDevelopmentMode: true,
      };
    }

    if (!BUCKET_NAME) {
      throw new Error('S3 bucket name not configured. Please set NEXT_PUBLIC_AWS_S3_BUCKET_NAME in .env.local');
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);
    const key = `${folder}/${filename}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      // ACL not used as bucket ownership is enforced
    });

    await s3Client.send(command);

    // Construct public URL
    const url = `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file',
    };
  }
};

/**
 * Upload course thumbnail
 */
export const uploadCourseThumbnail = async (file) => {
  return uploadToS3(file, S3_FOLDERS.COURSE_THUMBNAILS);
};

/**
 * Upload lesson video
 */
export const uploadLessonVideo = async (file) => {
  return uploadToS3(file, S3_FOLDERS.LESSON_VIDEOS);
};

/**
 * Upload lesson image
 */
export const uploadLessonImage = async (file) => {
  return uploadToS3(file, S3_FOLDERS.LESSON_IMAGES);
};

/**
 * Delete file from S3
 * @param {string} key - S3 object key
 */
export const deleteFromS3 = async (key) => {
  try {
    if (!key || !BUCKET_NAME) {
      throw new Error('Invalid parameters');
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    return { success: true };
  } catch (error) {
    console.error('S3 delete error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete file',
    };
  }
};

/**
 * Validate file type and size
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  } = options;

  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }

  return { valid: true };
};

/**
 * Validate image file
 */
export const validateImage = (file, maxSizeMB = 5) => {
  return validateFile(file, {
    maxSizeMB,
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  });
};

/**
 * Validate video file
 */
export const validateVideo = (file, maxSizeMB = 100) => {
  return validateFile(file, {
    maxSizeMB,
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
  });
};
