import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== COURSES ====================

/**
 * Get all courses
 */
export const getAllCourses = async () => {
  try {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

/**
 * Get a single course by ID with all modules and lessons
 */
export const getCourseById = async (courseId) => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      throw new Error('Course not found');
    }
    
    return {
      id: courseSnap.id,
      ...courseSnap.data(),
    };
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

/**
 * Create a new course
 */
export const createCourse = async (courseData) => {
  try {
    const courseRef = doc(collection(db, 'courses'));
    await setDoc(courseRef, {
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { id: courseRef.id, ...courseData };
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

/**
 * Update a course
 */
export const updateCourse = async (courseId, updates) => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// ==================== USER PROGRESS ====================

/**
 * Get user's course enrollments and progress
 */
export const getUserCourses = async (userId) => {
  try {
    const userCoursesRef = collection(db, 'userCourses');
    const q = query(userCoursesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    const userCourses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Fetch full course details for each enrollment
    const coursesWithDetails = await Promise.all(
      userCourses.map(async (userCourse) => {
        const course = await getCourseById(userCourse.courseId);
        return {
          ...course,
          progress: userCourse.progress || 0,
          status: userCourse.status || 'not-started',
          completedLessons: userCourse.completedLessons || [],
          lastAccessedAt: userCourse.lastAccessedAt,
        };
      })
    );
    
    return coursesWithDetails;
  } catch (error) {
    console.error('Error fetching user courses:', error);
    throw error;
  }
};

/**
 * Enroll user in a course
 */
export const enrollUserInCourse = async (userId, courseId) => {
  try {
    const enrollmentRef = doc(collection(db, 'userCourses'));
    await setDoc(enrollmentRef, {
      userId,
      courseId,
      progress: 0,
      status: 'in-progress',
      completedLessons: [],
      enrolledAt: serverTimestamp(),
      lastAccessedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error enrolling user:', error);
    throw error;
  }
};

/**
 * Mark a lesson as completed
 */
export const markLessonComplete = async (userId, courseId, lessonId) => {
  try {
    // Find the user's course enrollment
    const userCoursesRef = collection(db, 'userCourses');
    const q = query(
      userCoursesRef,
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('User not enrolled in this course');
    }
    
    const enrollmentDoc = snapshot.docs[0];
    const enrollmentRef = doc(db, 'userCourses', enrollmentDoc.id);
    
    // Add lesson to completed lessons
    await updateDoc(enrollmentRef, {
      completedLessons: arrayUnion(lessonId),
      lastAccessedAt: serverTimestamp(),
    });
    
    // Calculate and update progress
    const course = await getCourseById(courseId);
    const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
    const completedLessons = [...(enrollmentDoc.data().completedLessons || []), lessonId];
    const progress = Math.round((completedLessons.length / totalLessons) * 100);
    
    await updateDoc(enrollmentRef, {
      progress,
      status: progress === 100 ? 'completed' : 'in-progress',
    });
    
    return { success: true, progress };
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    throw error;
  }
};

/**
 * Mark a lesson as incomplete
 */
export const markLessonIncomplete = async (userId, courseId, lessonId) => {
  try {
    const userCoursesRef = collection(db, 'userCourses');
    const q = query(
      userCoursesRef,
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('User not enrolled in this course');
    }
    
    const enrollmentDoc = snapshot.docs[0];
    const enrollmentRef = doc(db, 'userCourses', enrollmentDoc.id);
    
    await updateDoc(enrollmentRef, {
      completedLessons: arrayRemove(lessonId),
      lastAccessedAt: serverTimestamp(),
    });
    
    // Recalculate progress
    const course = await getCourseById(courseId);
    const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
    const completedLessons = (enrollmentDoc.data().completedLessons || []).filter(id => id !== lessonId);
    const progress = Math.round((completedLessons.length / totalLessons) * 100);
    
    await updateDoc(enrollmentRef, {
      progress,
      status: 'in-progress',
    });
    
    return { success: true, progress };
  } catch (error) {
    console.error('Error marking lesson incomplete:', error);
    throw error;
  }
};

// ==================== USER PROFILE ====================

/**
 * Get user profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    return {
      id: userSnap.id,
      ...userSnap.data(),
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Create or update user profile
 */
export const setUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error('Error setting user profile:', error);
    throw error;
  }
};
/**
 * Delete a course
 */
export const deleteCourse = async (courseId) => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    await deleteDoc(courseRef);
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};
