# 🎯 Firebase Setup Checklist

Use this checklist to track your Firebase integration progress.

## Phase 1: Firebase Configuration ⚙️

- [ ] Created Firebase project at console.firebase.google.com
- [ ] Enabled Authentication → Email/Password
- [ ] Created Firestore Database in test mode
- [ ] (Optional) Enabled Storage
- [ ] Copied Firebase config from Project Settings
- [ ] Updated `.env.local` with all 7 Firebase variables
- [ ] Restarted development server (`npm run dev`)

## Phase 2: Initial Data Setup 📊

- [ ] Visited http://localhost:3000/seed-data
- [ ] Clicked "Seed Courses" button
- [ ] Verified success message appeared
- [ ] Checked Firebase Console → Firestore to see courses collection
- [ ] Created test user account via sign-up page
- [ ] Signed in with test account
- [ ] Returned to `/seed-data` and clicked "Enroll Current User"
- [ ] Verified enrollment in Firebase Console → userCourses collection

## Phase 3: Testing 🧪

- [ ] Navigated to http://localhost:3000/dashboard
- [ ] Confirmed courses are displayed
- [ ] Tested course filtering (All, In Progress, Completed)
- [ ] Clicked on a course to view details
- [ ] Verified modules and lessons are showing
- [ ] Tested sign out functionality
- [ ] Tested sign in again
- [ ] Verified data persists across sessions

## Phase 4: Integration (Next Steps) 🔄

- [ ] Updated `hooks/auth-api.js` to use Firebase auth functions
- [ ] Updated course fetching to use Firestore instead of mock APIs
- [ ] Implemented lesson detail page
- [ ] Added lesson completion functionality
- [ ] Tested progress tracking updates in real-time
- [ ] Verified progress persists in Firestore

## Phase 5: Production Preparation 🚀

- [ ] Added Firestore security rules
- [ ] Added Storage security rules (if using)
- [ ] Tested all auth flows (register, login, password reset)
- [ ] Verified email verification works
- [ ] Tested on mobile devices
- [ ] Optimized queries for performance
- [ ] Added error boundaries
- [ ] Set up error logging

## Phase 6: Deployment 🌐

- [ ] Pushed code to GitHub
- [ ] Created Vercel project
- [ ] Added all environment variables to Vercel
- [ ] Deployed to production
- [ ] Tested production deployment
- [ ] Updated Firebase authorized domains
- [ ] Verified authentication works in production
- [ ] Tested all features in production

## Troubleshooting Reference 🆘

### Issue: "Firebase not configured"
**Solution:**
1. Check `.env.local` exists and has all variables
2. Restart dev server
3. Check browser console for specific error

### Issue: "Permission denied" in Firestore
**Solution:**
1. Verify Firestore is in test mode
2. Check Firebase Console → Firestore → Rules
3. Ensure rules allow read/write

### Issue: Courses not showing
**Solution:**
1. Check if courses were seeded (Firebase Console)
2. Verify user is enrolled (check userCourses collection)
3. Check if user is signed in
4. Look for errors in browser console

### Issue: Authentication not working
**Solution:**
1. Verify Email/Password is enabled in Firebase Console
2. Check environment variables are correct
3. Clear browser cache and cookies
4. Try incognito/private mode

## Quick Commands 💻

```bash
# Restart dev server
npm run dev

# Check if Firebase is installed
npm list firebase

# Build for production
npm run build

# Start production server
npm start
```

## Resources 📚

- Firebase Console: https://console.firebase.google.com/
- Quick Start Guide: `QUICKSTART.md`
- Setup Guide: `FIREBASE_SETUP.md`
- Integration Guide: `FIREBASE_INTEGRATION.md`
- Summary: `FIREBASE_COMPLETE.md`

---

**Current Status:** _____ / 35 tasks completed

**Last Updated:** _________________

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
