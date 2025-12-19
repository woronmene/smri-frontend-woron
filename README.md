# SMRI Learning Platform

A modern, full-featured Learning Management System (LMS) built with Next.js and Firebase. This platform provides a complete educational experience with course management, progress tracking, and user authentication.

## 🌟 Features

- ✅ **User Authentication** - Email/password registration, login, password reset
- ✅ **Admin Course Creation** - Create courses with thumbnails, descriptions, and metadata
- ✅ **AWS S3 Media Storage** - Upload and store course thumbnails, videos, and images
- ✅ **Course Management** - Browse courses, view modules and lessons
- ✅ **Progress Tracking** - Automatic progress calculation and lesson completion
- ✅ **Responsive Dashboard** - Clean, modern UI with course filtering
- ✅ **Real-time Updates** - Firebase integration for live data sync
- ✅ **Mock Data Support** - Pre-built sample courses for testing


## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

**Option A: Quick Setup (5 minutes)**
- Follow the step-by-step guide in [`QUICKSTART.md`](./QUICKSTART.md)

**Option B: Detailed Setup**
- See [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) for comprehensive instructions

**TL;DR:**
1. Create Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email/Password) and Firestore
3. Copy config to `.env.local` (already created in project root)
4. Restart dev server

### 3. Configure AWS S3 (For Media Storage)

**Required for course creation with thumbnails/videos**

See [`AWS_S3_SETUP.md`](./AWS_S3_SETUP.md) for detailed instructions.

**TL;DR:**
1. Create AWS account and S3 bucket
2. Create IAM user with S3 permissions
3. Add AWS credentials to `.env.local`:
   ```bash
   NEXT_PUBLIC_AWS_REGION=us-east-1
   NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-key
   NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret
   NEXT_PUBLIC_AWS_S3_BUCKET_NAME=your-bucket
   ```
4. Restart dev server

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 5. Seed Sample Data (Optional)

1. Navigate to http://localhost:3000/seed-data
2. Click "Seed Courses" to populate database
3. Create a test account via sign-up
4. Return to `/seed-data` and click "Enroll Current User"
5. View your courses at http://localhost:3000/dashboard

## 📁 Project Structure

```
smri-frontend/
├── app/                      # Next.js app directory
│   ├── auth/                # Authentication pages
│   ├── admin/               # Admin panel
│   │   └── courses/        # Course management
│   ├── dashboard/           # Student dashboard
│   ├── api/                 # API routes (legacy mock)
│   └── seed-data/           # Admin seeding page
├── components/              # React components
│   ├── dashboard/          # Dashboard-specific components
│   └── ui/                 # Reusable UI components
├── lib/                     # Utility libraries
│   ├── firebase.js         # Firebase initialization
│   ├── firebase-auth.js    # Auth functions
│   ├── firebase-db.js      # Database operations
│   ├── firebase-seed.js    # Sample data
│   ├── s3-config.js        # AWS S3 configuration
│   └── s3-upload.js        # S3 upload utilities
├── hooks/                   # Custom React hooks
├── context/                 # React context providers
└── public/                  # Static assets
```

## 🔥 Firebase Integration

This project uses Firebase for:
- **Authentication** - User registration, login, password reset
- **Firestore** - Course data, user progress, enrollments

## ☁️ AWS S3 Integration

This project uses AWS S3 for:
- **Course Thumbnails** - Stored in `courses/thumbnails/`
- **Lesson Videos** - Stored in `lessons/videos/`
- **Lesson Images** - Stored in `lessons/images/`

**Note**: Firebase Storage is not used due to availability constraints.

### Data Structure

```
Firestore Collections:
├── courses/              # Course catalog
├── users/               # User profiles
└── userCourses/         # Enrollment & progress tracking
```

For detailed Firebase documentation, see:
- [`FIREBASE_INTEGRATION.md`](./FIREBASE_INTEGRATION.md) - Complete integration guide
- [`QUICKSTART.md`](./QUICKSTART.md) - 5-minute setup guide

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.0
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Auth + Firestore)
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI + Custom components
- **Icons**: Lucide React

## 📚 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎯 Key Features Explained

### Authentication Flow
1. User registers with email/password
2. Email verification sent automatically
3. User can sign in and access dashboard
4. Password reset available via email

### Course Experience
1. Browse all courses on dashboard
2. Filter by status (All, In Progress, Completed)
3. Click course to view modules and lessons
4. Track progress automatically
5. Mark lessons as complete

### Progress Tracking
- Automatic calculation based on completed lessons
- Real-time updates across all devices
- Visual progress bars on course cards
- Status badges (In Progress, Completed)

## 🔒 Security

- Environment variables for Firebase config
- `.env.local` is gitignored (never commit credentials)
- Firestore security rules (see `FIREBASE_INTEGRATION.md`)
- Email verification for new accounts

## 📖 Documentation

- [`QUICKSTART.md`](./QUICKSTART.md) - Get started in 5 minutes
- [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) - Detailed Firebase setup
- [`FIREBASE_INTEGRATION.md`](./FIREBASE_INTEGRATION.md) - Integration guide & API reference
- [`AWS_S3_SETUP.md`](./AWS_S3_SETUP.md) - AWS S3 configuration for media storage
- [`CREATE_COURSE_IMPLEMENTATION.md`](./CREATE_COURSE_IMPLEMENTATION.md) - Admin course creation guide

## 🆘 Troubleshooting

**Firebase not configured error:**
- Ensure `.env.local` exists with all 7 Firebase variables
- Restart dev server after adding env variables

**Courses not showing:**
- Visit `/seed-data` to populate database
- Ensure you're signed in
- Check Firebase Console for data

**Authentication errors:**
- Verify Email/Password is enabled in Firebase Console
- Check browser console for detailed error messages

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (same as `.env.local`)
4. Deploy!

See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📝 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

This is a client project. For questions or issues, contact the development team.

---

**Ready to get started?** Follow the [Quick Start Guide](./QUICKSTART.md)!
