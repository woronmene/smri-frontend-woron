# Firebase Integration Guide

This document explains how Firebase is integrated into the SMRI Learning Platform and how to use it.

## 📁 Project Structure

```
lib/
├── firebase.js          # Firebase initialization and config
├── firebase-auth.js     # Authentication functions
├── firebase-db.js       # Firestore database operations
└── firebase-seed.js     # Sample data seeding

app/
└── seed-data/
    └── page.jsx         # Admin page for seeding data
```

## 🔥 Firebase Services Used

### 1. **Firebase Authentication**
- Email/Password authentication
- User registration with email verification
- Password reset functionality
- Session management

### 2. **Firestore Database**
Collections structure:
```
courses/
  {courseId}/
    - title
    - description
    - thumbnail
    - category
    - level
    - duration
    - modules[]
      - lessons[]
    - createdAt
    - updatedAt

users/
  {userId}/
    - email
    - displayName
    - role
    - createdAt
    - updatedAt

userCourses/
  {enrollmentId}/
    - userId
    - courseId
    - progress (0-100)
    - status (not-started, in-progress, completed)
    - completedLessons[]
    - enrolledAt
    - lastAccessedAt
```

### 3. **Firebase Storage** (Optional)
- Course thumbnails
- User profile images
- Course materials/attachments

## 🚀 Getting Started

### Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable these services:
   - **Authentication** → Email/Password
   - **Firestore Database** → Start in test mode
   - **Storage** (optional) → Start in test mode

### Step 2: Get Firebase Config

1. Project Settings → General
2. Scroll to "Your apps" → Add web app
3. Copy the `firebaseConfig` object

### Step 3: Configure Environment Variables

Create `.env.local` in project root:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123
```

### Step 4: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 5: Seed Sample Data

1. Navigate to `http://localhost:3000/seed-data`
2. Click "Seed Courses" to create sample courses
3. Register a new user account
4. Sign in with your account
5. Go back to `/seed-data` and click "Enroll Current User"
6. Navigate to `/dashboard` to see your courses!

## 📚 Available Functions

### Authentication (`lib/firebase-auth.js`)

```javascript
import { registerUser, loginUser, logoutUser, sendPasswordReset } from '@/lib/firebase-auth';

// Register new user
const result = await registerUser(email, password, displayName);

// Login
const result = await loginUser(email, password);

// Logout
await logoutUser();

// Password reset
await sendPasswordReset(email);

// Get current user
const user = getCurrentUser();

// Get user token
const token = await getUserToken();
```

### Database Operations (`lib/firebase-db.js`)

```javascript
import { 
  getAllCourses, 
  getCourseById, 
  getUserCourses,
  enrollUserInCourse,
  markLessonComplete 
} from '@/lib/firebase-db';

// Get all courses
const courses = await getAllCourses();

// Get specific course
const course = await getCourseById('course-1');

// Get user's enrolled courses
const userCourses = await getUserCourses(userId);

// Enroll user in course
await enrollUserInCourse(userId, courseId);

// Mark lesson as complete
await markLessonComplete(userId, courseId, lessonId);
```

## 🔄 Updating Existing Code

### Update Auth Hooks (`hooks/auth-api.js`)

Replace mock API calls with Firebase functions:

```javascript
import { loginUser, registerUser } from '@/lib/firebase-auth';

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const result = await loginUser(email, password);
      if (!result.success) throw new Error(result.message);
      return result;
    },
  });
}
```

### Update Course Fetching

Replace `/api/courses` calls with Firebase:

```javascript
import { getAllCourses, getUserCourses } from '@/lib/firebase-db';

const fetchCourses = async (userId) => {
  // Get user's enrolled courses with progress
  return await getUserCourses(userId);
};
```

## 🔒 Security Rules

### Firestore Rules (Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read all courses
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only read/write their own course enrollments
    match /userCourses/{enrollmentId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### Storage Rules (Production)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /course-thumbnails/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    match /user-uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🧪 Testing

### Test Mode (Development)
For development, you can use test mode rules that allow all reads/writes. **Never use in production!**

### Sample Test User
After seeding, create a test account:
- Email: `test@example.com`
- Password: `Test123!`

## 🎯 Next Steps

1. ✅ Configure Firebase project
2. ✅ Add environment variables
3. ✅ Seed sample data
4. ⬜ Update authentication hooks to use Firebase
5. ⬜ Update course fetching to use Firestore
6. ⬜ Implement real-time progress tracking
7. ⬜ Add Firebase security rules
8. ⬜ Deploy to production

## 🆘 Troubleshooting

### "Firebase not configured" error
- Check that `.env.local` exists and has all required variables
- Restart dev server after adding env variables

### "Permission denied" error
- Check Firestore security rules
- Ensure user is authenticated
- Verify user has access to the resource

### Seed data not appearing
- Check Firebase Console → Firestore Database
- Verify seed script ran successfully
- Check browser console for errors

## 📖 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
