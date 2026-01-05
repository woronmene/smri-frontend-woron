const ANALYTICS_API_URL =
  process.env.NEXT_PUBLIC_ANALYTICS_API_URL || "https://qgvpakcl84.execute-api.us-east-1.amazonaws.com";

/**
 * Helper for making analytics API requests
 */
const analyticsRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${ANALYTICS_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = "Analytics API error";
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
 * Mark a lesson as complete for a given student.
 *
 * For now, caller is responsible for passing userId / schoolId (mock or real).
 */
export const markLessonComplete = async ({
  userId,
  schoolId = null,
  courseId,
  moduleId,
  lessonId,
}) => {
  return analyticsRequest("/progress/lessons/complete", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      school_id: schoolId,
      course_id: courseId,
      module_id: moduleId,
      lesson_id: lessonId,
    }),
  });
};

/**
 * Fetch aggregated progress for all students in a course.
 * (Currently returns user_id, course_id, completed_lesson_ids, completed_count, last_completed_at)
 */
export const getCourseStudentsProgress = async (courseId) => {
  return analyticsRequest(`/progress/courses/${courseId}/students`, {
    method: "GET",
  });
};

export const getStudentCourseProgress = async (userId, courseId) => {
  return analyticsRequest(`/progress/students/${userId}/courses/${courseId}`, {
    method: "GET",
  });
};

/**
 * Fetch aggregated progress for all students in a course for a specific school.
 * Backed by GSI2 (school_id + course_id).
 */
export const getSchoolCourseStudentsProgress = async (schoolId, courseId) => {
  return analyticsRequest(
    `/progress/schools/${schoolId}/courses/${courseId}/students`,
    {
      method: "GET",
    }
  );
};
