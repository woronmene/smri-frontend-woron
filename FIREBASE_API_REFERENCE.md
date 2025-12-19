# 🔥 Firebase Quick Reference

Quick reference for all Firebase functions available in the project.

## 🔐 Authentication (`lib/firebase-auth.js`)

### Register New User
```javascript
import { registerUser } from '@/lib/firebase-auth';

const result = await registerUser(email, password, displayName);
// Returns: { success: true/false, user, message }
```

### Login User
```javascript
import { loginUser } from '@/lib/firebase-auth';

const result = await loginUser(email, password);
// Returns: { success: true/false, user, token, message }
```

### Logout User
```javascript
import { logoutUser } from '@/lib/firebase-auth';

const result = await logoutUser();
// Returns: { success: true/false }
```

### Send Password Reset Email
```javascript
import { sendPasswordReset } from '@/lib/firebase-auth';

const result = await sendPasswordReset(email);
// Returns: { success: true/false, message }
```

### Reset Password with Code
```javascript
import { resetPassword } from '@/lib/firebase-auth';

const result = await resetPassword(oobCode, newPassword);
// Returns: { success: true/false, message }
```

### Get Current User
```javascript
import { getCurrentUser } from '@/lib/firebase-auth';

const user = getCurrentUser();
// Returns: User object or null
```

### Get User Token
```javascript
import { getUserToken } from '@/lib/firebase-auth';

const token = await getUserToken();
// Returns: JWT token string or null
```

---

## 💾 Database Operations (`lib/firebase-db.js`)

### Get All Courses
```javascript
import { getAllCourses } from '@/lib/firebase-db';

const courses = await getAllCourses();
// Returns: Array of course objects
```

### Get Course by ID
```javascript
import { getCourseById } from '@/lib/firebase-db';

const course = await getCourseById(courseId);
// Returns: Course object with modules and lessons
```

### Create New Course
```javascript
import { createCourse } from '@/lib/firebase-db';

const courseData = {
  title: 'Course Title',
  description: 'Course description',
  thumbnail: 'https://...',
  category: 'Category',
  level: 'Beginner',
  duration: '2 hours',
  modules: [...]
};

const result = await createCourse(courseData);
// Returns: { id, ...courseData }
```

### Update Course
```javascript
import { updateCourse } from '@/lib/firebase-db';

const updates = { title: 'New Title' };
const result = await updateCourse(courseId, updates);
// Returns: { success: true }
```

### Get User's Enrolled Courses
```javascript
import { getUserCourses } from '@/lib/firebase-db';

const userCourses = await getUserCourses(userId);
// Returns: Array of courses with progress data
```

### Enroll User in Course
```javascript
import { enrollUserInCourse } from '@/lib/firebase-db';

const result = await enrollUserInCourse(userId, courseId);
// Returns: { success: true }
```

### Mark Lesson as Complete
```javascript
import { markLessonComplete } from '@/lib/firebase-db';

const result = await markLessonComplete(userId, courseId, lessonId);
// Returns: { success: true, progress }
```

### Mark Lesson as Incomplete
```javascript
import { markLessonIncomplete } from '@/lib/firebase-db';

const result = await markLessonIncomplete(userId, courseId, lessonId);
// Returns: { success: true, progress }
```

### Get User Profile
```javascript
import { getUserProfile } from '@/lib/firebase-db';

const profile = await getUserProfile(userId);
// Returns: User profile object or null
```

### Set/Update User Profile
```javascript
import { setUserProfile } from '@/lib/firebase-db';

const profileData = {
  email: 'user@example.com',
  displayName: 'John Doe',
  role: 'student'
};

const result = await setUserProfile(userId, profileData);
// Returns: { success: true }
```

---

## 🌱 Seeding Functions (`lib/firebase-seed.js`)

### Seed All Courses
```javascript
import { seedCourses } from '@/lib/firebase-seed';

const result = await seedCourses();
// Returns: { success: true, count: 3 }
// Creates 3 sample courses in Firestore
```

### Create Sample User Profile
```javascript
import { createSampleUserProfile } from '@/lib/firebase-seed';

const userData = {
  email: 'user@example.com',
  displayName: 'John Doe'
};

const result = await createSampleUserProfile(userId, userData);
// Returns: { success: true }
```

### Enroll Sample User in All Courses
```javascript
import { enrollSampleUserInCourses } from '@/lib/firebase-seed';

const result = await enrollSampleUserInCourses(userId);
// Returns: { success: true }
// Enrolls user in all 3 sample courses
```

---

## 📊 Data Structures

### Course Object
```javascript
{
  id: 'course-1',
  title: 'Course Title',
  description: 'Course description',
  thumbnail: 'https://...',
  category: 'Category Name',
  level: 'Beginner|Intermediate|Advanced',
  duration: '2 hours',
  modules: [
    {
      id: 'm1',
      title: 'Module Title',
      description: 'Module description',
      lessons: [
        {
          id: 'l1',
          title: 'Lesson Title',
          introduction: 'Brief intro',
          content: 'HTML content',
          videoUrl: 'https://...' or null,
          duration: '15 min',
          order: 1
        }
      ]
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### User Course Enrollment
```javascript
{
  id: 'enrollment-id',
  userId: 'user-id',
  courseId: 'course-id',
  progress: 35,  // 0-100
  status: 'not-started|in-progress|completed',
  completedLessons: ['l1', 'l2'],
  enrolledAt: Timestamp,
  lastAccessedAt: Timestamp
}
```

### User Profile
```javascript
{
  id: 'user-id',
  email: 'user@example.com',
  displayName: 'John Doe',
  role: 'student|instructor|admin',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🎯 Common Patterns

### Complete Auth Flow
```javascript
import { registerUser, loginUser, getCurrentUser } from '@/lib/firebase-auth';

// 1. Register
const regResult = await registerUser('user@example.com', 'password123', 'John Doe');

// 2. Login
const loginResult = await loginUser('user@example.com', 'password123');

// 3. Get current user
const user = getCurrentUser();
console.log(user.uid, user.email);
```

### Complete Course Enrollment Flow
```javascript
import { getAllCourses, enrollUserInCourse, getUserCourses } from '@/lib/firebase-db';
import { getCurrentUser } from '@/lib/firebase-auth';

// 1. Get all available courses
const courses = await getAllCourses();

// 2. Enroll user in a course
const user = getCurrentUser();
await enrollUserInCourse(user.uid, courses[0].id);

// 3. Get user's enrolled courses
const myCourses = await getUserCourses(user.uid);
```

### Track Lesson Progress
```javascript
import { markLessonComplete, getUserCourses } from '@/lib/firebase-db';
import { getCurrentUser } from '@/lib/firebase-auth';

const user = getCurrentUser();
const courseId = 'course-1';
const lessonId = 'l1';

// Mark lesson complete
const result = await markLessonComplete(user.uid, courseId, lessonId);
console.log('New progress:', result.progress); // e.g., 35%

// Get updated course data
const courses = await getUserCourses(user.uid);
const course = courses.find(c => c.id === courseId);
console.log('Completed lessons:', course.completedLessons);
```

---

## 🔍 Error Handling

All functions return consistent response objects:

### Success Response
```javascript
{
  success: true,
  // ... additional data
}
```

### Error Response
```javascript
{
  success: false,
  error: 'error-code',
  message: 'User-friendly error message'
}
```

### Example with Error Handling
```javascript
const result = await loginUser(email, password);

if (result.success) {
  console.log('Logged in!', result.user);
  // Proceed with login
} else {
  console.error('Login failed:', result.message);
  // Show error to user
}
```

---

## 💡 Tips

- All auth functions return user-friendly error messages
- Database functions throw errors (use try/catch)
- Progress is automatically calculated when marking lessons complete
- Timestamps are added automatically (createdAt, updatedAt)
- All functions are async - always use `await`

---

**Need more details?** See `FIREBASE_INTEGRATION.md` for complete documentation.
