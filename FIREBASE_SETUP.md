# Firebase Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## Step 2: Enable Firebase Services

### Authentication
1. In Firebase Console, go to **Authentication** → **Get Started**
2. Enable the following sign-in methods:
   - **Email/Password** ✅
   - (Optional) Google, Facebook, etc.

### Firestore Database
1. Go to **Firestore Database** → **Create Database**
2. Start in **Test Mode** (we'll add security rules later)
3. Choose a location close to your users

### Storage (Optional)
1. Go to **Storage** → **Get Started**
2. Start in **Test Mode**
3. This will be used for course thumbnails and media

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "SMRI Frontend")
5. Copy the `firebaseConfig` object

## Step 4: Create Environment Variables File

Create a file named `.env.local` in the project root with the following content:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**Replace the values** with your actual Firebase config values from Step 3.

## Step 5: Restart Development Server

After creating `.env.local`, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Step 6: Seed Initial Data (Optional)

We'll create a script to populate Firestore with sample courses and users for testing.

## Security Notes

- `.env.local` is already in `.gitignore` - your credentials won't be committed
- The `NEXT_PUBLIC_` prefix makes these variables available in the browser
- For production, use Firebase security rules to protect your data
- Never commit actual API keys to version control

## Next Steps

Once Firebase is configured, we'll:
1. ✅ Set up authentication hooks
2. ✅ Create Firestore data structure
3. ✅ Build CRUD operations for courses
4. ✅ Implement user progress tracking
5. ✅ Add real-time updates
