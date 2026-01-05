const USER_API_URL =
  process.env.NEXT_PUBLIC_USER_SERVICE_URL || "https://0qdrpi2zhe.execute-api.us-east-1.amazonaws.com";

/**
 * Helper for making User API requests
 */
const userApiRequest = async (endpoint, options = {}) => {
  // Attach auth token from localStorage when running in the browser
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  const response = await fetch(`${USER_API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "User API error";
    try {
      const data = await response.json();
      message = data.detail || data.message || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

/**
 * Fetch all schools (SMRI Admin view).
 */
export const getSchools = async (limit = 100, cursor = null) => {
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit);
  if (cursor) params.set("cursor", cursor);

  return userApiRequest(`/admin/schools?${params.toString()}`, {
    method: "GET",
  });
};

/**
 * Fetch students for a school.
 * For teachers/school_admins, the backend enforces their own school_id.
 * For SMRI admins, they can pass a specific schoolId to view.
 */
export const getSchoolStudents = async (
  schoolId = null,
  limit = 100,
  cursor = null
) => {
  const params = new URLSearchParams();
  if (schoolId) params.set("school_id", schoolId);
  if (limit) params.set("limit", limit);
  if (cursor) params.set("cursor", cursor);

  // The endpoint filters for role='student' automatically
  return userApiRequest(`/admin/users/students?${params.toString()}`, {
    method: "GET",
  });
};

/**
 * Fetch teachers for a school.
 * - For school_admin / school org tokens, the backend ignores school_id and forces their own school.
 * - For SMRI admins, an explicit schoolId will scope the results; omitting it lists teachers across all schools.
 */
export const getSchoolTeachers = async (
  schoolId = null,
  limit = 100,
  cursor = null
) => {
  const params = new URLSearchParams();
  if (schoolId) params.set("school_id", schoolId);
  if (limit) params.set("limit", limit);
  if (cursor) params.set("cursor", cursor);

  // The endpoint filters for role='teacher' automatically
  return userApiRequest(`/admin/users/teachers?${params.toString()}`, {
    method: "GET",
  });
};

/**
 * Update current user profile (first_name, last_name, etc.)
 */
export const updateUserProfile = async (payload) => {
  return userApiRequest(`/users`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const updateUserRole = async (userId, role) => {
  return userApiRequest(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
};

/**
 * Fetch the current user's school details.
 * The backend verifies the token and returns the school associated with it.
 */
export const getMySchool = async () => {
  return userApiRequest(`/users/school`, {
    method: "GET",
  });
};

/**
 * Get a presigned upload URL for a user avatar.
 * content_type should be one of "image/jpeg", "image/png", "image/webp", "image/gif".
 */
export const getAvatarUploadUrl = async (contentType) => {
  return userApiRequest(`/users/avatar/upload-url`, {
    method: "POST",
    body: JSON.stringify({ content_type: contentType }),
  });
};

/**
 * Update the current user's avatar with the uploaded object key.
 */
export const setUserAvatar = async (objectKey) => {
  return userApiRequest(`/users/me/avatar`, {
    method: "PUT",
    body: JSON.stringify({ object_key: objectKey }),
  });
};
