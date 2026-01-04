const CMS_API_URL =
  process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:8003";

/**
 * Helper for making API requests
 */
const apiRequest = async (endpoint, options = {}, userRole = null) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Pass simulated auth header if a role is provided
  if (userRole) {
    headers["X-User-Role"] = userRole;
  }

  const response = await fetch(`${CMS_API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Attempt to parse error
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      // Ignore parsing error
    }

    throw new Error(errorMessage);
  }

  // Return null for 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

/**
 * Get all courses
 * supports filtering by userRole (admin see all, others see published)
 */
export const getAllCourses = async (userRole = null) => {
  console.log("fetching courses on the frontend");
  try {
    return await apiRequest("/courses", { method: "GET" }, userRole);
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

/**
 * Get a single course by ID
 */
export const getCourseById = async (courseId) => {
  try {
    return await apiRequest(`/courses/${courseId}`, { method: "GET" });
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

/**
 * Create a new course
 */
export const createCourse = async (courseData) => {
  try {
    return await apiRequest("/courses", {
      method: "POST",
      body: JSON.stringify(courseData),
    });
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

/**
 * Update a course
 */
export const updateCourse = async (courseId, updates) => {
  try {
    return await apiRequest(`/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

/**
 * Delete a course
 */
export const deleteCourse = async (courseId) => {
  try {
    await apiRequest(`/courses/${courseId}`, { method: "DELETE" });
    return true;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

// ==================== MODULES & LESSONS ====================

export const createModule = async (courseId, moduleData) => {
  try {
    return await apiRequest(`/courses/${courseId}/modules`, {
      method: "POST",
      body: JSON.stringify(moduleData),
    });
  } catch (error) {
    console.error("Error creating module:", error);
    throw error;
  }
};

export const updateModule = async (courseId, moduleId, updates) => {
  try {
    return await apiRequest(`/courses/${courseId}/modules/${moduleId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error("Error updating module:", error);
    throw error;
  }
};

export const deleteModule = async (courseId, moduleId) => {
  try {
    await apiRequest(`/courses/${courseId}/modules/${moduleId}`, {
      method: "DELETE",
    });
    return true;
  } catch (error) {
    console.error("Error deleting module:", error);
    throw error;
  }
};

export const createLesson = async (courseId, moduleId, lessonData) => {
  try {
    return await apiRequest(
      `/courses/${courseId}/modules/${moduleId}/lessons`,
      {
        method: "POST",
        body: JSON.stringify(lessonData),
      }
    );
  } catch (error) {
    console.error("Error creating lesson:", error);
    throw error;
  }
};

export const updateLesson = async (courseId, moduleId, lessonId, updates) => {
  try {
    return await apiRequest(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw error;
  }
};

export const deleteLesson = async (courseId, moduleId, lessonId) => {
  try {
    await apiRequest(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
      { method: "DELETE" }
    );
    return true;
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw error;
  }
};

/**
 * Get a presigned URL for S3 content
 */
export const getPresignedContentUrl = async (s3Uri) => {
  try {
    const res = await apiRequest("/courses/sign-content", {
      method: "POST",
      body: JSON.stringify({ s3_uri: s3Uri }),
    });
    return res.signed_url;
  } catch (error) {
    console.error("Error signing content URL:", error);
    throw error;
  }
};
