# 🚀 Quick Start Guide - Firebase Setup

Follow these steps to get Firebase working with your SMRI application.

## ⚡ 5-Minute Setup

### 1️⃣ Create Firebase Project (2 min)

1. Visit: https://console.firebase.google.com/
2. Click **"Add project"**
3. Name it: `smri-learning` (or your choice)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### 2️⃣ Enable Services (1 min)

**Authentication:**
- Click **"Authentication"** → **"Get started"**
- Click **"Email/Password"** → Enable → Save

**Firestore:**
- Click **"Firestore Database"** → **"Create database"**
- Select **"Start in test mode"** → Next
- Choose location (closest to you) → Enable

### 3️⃣ Get Your Config (1 min)

1. Click ⚙️ **Settings** icon → **"Project settings"**
2. Scroll to **"Your apps"** section
3. Click **Web icon** `</>`
4. App nickname: `smri-frontend` → Register app
5. **Copy the config values** (you'll see something like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "smri-learning.firebaseapp.com",
  projectId: "smri-learning",
  storageBucket: "smri-learning.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-ABC123"
};
```

### 4️⃣ Add Config to Project (1 min)

1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual Firebase config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=smri-learning.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=smri-learning
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=smri-learning.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123
```

3. **Save the file**

### 5️⃣ Restart & Test (30 sec)

```bash
# Stop your dev server (Ctrl+C in terminal)
# Start it again:
npm run dev
```

## 🎯 Next: Add Sample Data

1. Open: http://localhost:3000/seed-data
2. Click **"Seed Courses"** button
3. Wait for success message ✅
4. Go to: http://localhost:3000/auth/sign-up
5. Create a test account
6. Sign in with your new account
7. Go back to: http://localhost:3000/seed-data
8. Click **"Enroll Current User"** button
9. Navigate to: http://localhost:3000/dashboard
10. **See your courses!** 🎉

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Config values copied to `.env.local`
- [ ] Dev server restarted
- [ ] Sample courses seeded
- [ ] Test user created and enrolled
- [ ] Dashboard shows courses

## 🆘 Having Issues?

### Error: "Firebase not configured"
→ Check `.env.local` has all 7 variables
→ Restart dev server

### Error: "Permission denied"
→ Make sure Firestore is in **test mode**
→ Check Firebase Console → Firestore → Rules

### Courses not showing
→ Did you seed the data? Go to `/seed-data`
→ Did you enroll the user? Click "Enroll Current User"
→ Are you signed in?

## 📚 Full Documentation

- **Setup Details**: See `FIREBASE_SETUP.md`
- **Integration Guide**: See `FIREBASE_INTEGRATION.md`
- **Code Examples**: See `lib/firebase-*.js` files

---

**Need help?** Check the Firebase Console for errors or review the detailed guides.
