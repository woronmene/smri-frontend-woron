/**
 * media-api.js
 *
 * Handles interaction with the SMRI Media Service for secure file uploads
 * and status tracking. Replaces the legacy s3-upload.js.
 */

// The base URL of the deployed Media Service
const MEDIA_SERVICE_URL =
  process.env.NEXT_PUBLIC_MEDIA_API_URL ||
  "https://34gex7izc1.execute-api.us-east-1.amazonaws.com";

/**
 * Validate file type and size
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSizeMB = 10,
    allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  } = options;

  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
};

export const validateImage = (file, maxSizeMB = 10) => {
  return validateFile(file, {
    maxSizeMB,
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/gif",
    ],
  });
};

export const validateVideo = (file, maxSizeMB = 500) => {
  return validateFile(file, {
    maxSizeMB,
    allowedTypes: ["video/mp4", "video/quicktime", "video/x-m4v"],
  });
};

export const validateAudio = (file, maxSizeMB = 50) => {
  return validateFile(file, {
    maxSizeMB,
    allowedTypes: ["audio/mpeg", "audio/mp4", "audio/aac"],
  });
};

/**
 * Get a Presigned Upload URL from the Media Service
 *
 * @param {Object} params
 * @param {string} params.fileType - MIME type of the file (e.g. 'video/mp4')
 * @param {string} params.mediaType - 'video', 'audio', or 'image'
 * @param {string} params.courseId
 * @param {string} params.courseTitle
 * @param {number} params.moduleNumber
 * @param {number} params.lessonNumber
 */
/**
 * Get a Presigned Upload URL from the Media Service
 *
 * @param {Object} params
 * @param {string} params.fileType - MIME type of the file (e.g. 'video/mp4')
 * @param {string} params.mediaType - 'video', 'audio', or 'image'
 * @param {string} params.courseId
 * @param {string} params.courseTitle
 * @param {number} params.moduleNumber
 * @param {number} params.lessonNumber
 */
export const getUploadUrl = async ({
  fileType,
  mediaType,
  courseId,
  courseTitle,
  moduleNumber,
  lessonNumber,
}) => {
  // Determine endpoint based on media type logic in the service
  // Service now has separated endpoints
  const baseUrl = MEDIA_SERVICE_URL.replace(/\/$/, "");
  let endpoint;
  if (mediaType === "image") {
    endpoint = `${baseUrl}/media/image/upload-url`;
  } else if (mediaType === "audio") {
    endpoint = `${baseUrl}/media/audio/upload-url`;
  } else {
    // video
    endpoint = `${baseUrl}/media/video/upload-url`;
  }

  // Adjust mediaType for the payload if needed.
  // The service expects "video", "audio", or "image" in the body for valid checks.

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content_type: fileType,
      media_type: mediaType,
      course_id: courseId,
      course_title: courseTitle,
      module_number: moduleNumber,
      lesson_number: lessonNumber,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to get upload URL: ${response.statusText}`,
    );
  }

  return response.json();
};

/**
 * Upload the file directly to S3 using the presigned fields
 *
 * @param {string} uploadUrl - The base S3 URL returned by getUploadUrl
 * @param {Object} fields - The form fields returned by getUploadUrl
 * @param {File} file - The actual file object
 */
export const uploadFileToS3 = async (uploadUrl, fields, file) => {
  const formData = new FormData();

  // Append all presigned fields
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // Append the file (must be last usually)
  formData.append("file", file);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`S3 Upload failed: ${response.statusText}`);
  }

  return true;
};

/**
 * Check the status of a media item
 *
 * @param {string} mediaId
 * @param {string} mediaType - 'video', 'audio', or 'image'
 */
export const getMediaItem = async (mediaId, mediaType) => {
  // Endpoint differs by type again
  let endpoint;
  if (mediaType === "image") {
    endpoint = `${MEDIA_SERVICE_URL}/media/image/${mediaId}`;
  } else if (mediaType === "audio") {
    endpoint = `${MEDIA_SERVICE_URL}/media/audio/${mediaId}`;
  } else {
    endpoint = `${MEDIA_SERVICE_URL}/media/video/${mediaId}`;
  }

  const response = await fetch(endpoint);

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch media status: ${response.statusText}`);
  }

  return response.json();
};

/**
 * High-level orchestration function to upload a media file
 */
export const uploadMedia = async ({
  file,
  mediaType, // 'video', 'audio', 'image'
  courseId,
  courseTitle,
  moduleNumber,
  lessonNumber,
}) => {
  // 1. Validate
  let validation;
  if (mediaType === "image") validation = validateImage(file);
  else if (mediaType === "video") validation = validateVideo(file);
  else if (mediaType === "audio") validation = validateAudio(file);
  else validation = { valid: true }; // Fallback

  if (!validation.valid) throw new Error(validation.error);

  // 2. Get Presigned URL
  const presignedData = await getUploadUrl({
    fileType: file.type,
    mediaType,
    courseId,
    courseTitle,
    moduleNumber,
    lessonNumber,
  });

  // 3. Upload to S3
  await uploadFileToS3(presignedData.url, presignedData.fields, file);

  return {
    mediaId: presignedData.media_id,
    objectUrl: presignedData.object_url, // Direct S3 URL (temporary/private usually, but here public-ish)
    // If image, we might want to construct the final URL immediately if possible?
    // The service returns `object_url` but the final consumption might want CloudFront.
    // For AV, it's definitely PENDING logic.
  };
};
