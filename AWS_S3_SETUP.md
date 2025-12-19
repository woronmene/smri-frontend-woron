# AWS S3 Setup Guide for Media Storage

## Overview

This project uses **AWS S3** for storing all media assets including:
- Course thumbnails
- Lesson videos
- Lesson images

Firebase Storage is not used due to availability constraints.

## 📋 Prerequisites

- AWS Account
- AWS Access Key ID
- AWS Secret Access Key
- S3 Bucket created

## 🚀 Quick Setup

### Step 1: Create AWS Account

1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the registration process

### Step 2: Create S3 Bucket

1. Sign in to AWS Console
2. Navigate to **S3** service
3. Click **"Create bucket"**
4. Configure:
   - **Bucket name**: `smri-learning-media` (or your choice - must be globally unique)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Block Public Access**: Uncheck "Block all public access" (we need public read access)
   - **Bucket Versioning**: Disabled (optional)
5. Click **"Create bucket"**

### Step 3: Configure Bucket Policy

1. Select your bucket
2. Go to **Permissions** tab
3. Scroll to **Bucket policy**
4. Click **Edit** and paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::smri-learning-media/*"
    }
  ]
}
```

**Important**: Replace `smri-learning-media` with your actual bucket name.

5. Click **Save changes**

### Step 4: Create IAM User for Programmatic Access

1. Navigate to **IAM** service
2. Click **Users** → **Add users**
3. User name: `smri-s3-uploader`
4. Select **Access key - Programmatic access**
5. Click **Next: Permissions**
6. Click **Attach existing policies directly**
7. Search and select: **AmazonS3FullAccess** (or create custom policy below)
8. Click **Next** → **Create user**
9. **IMPORTANT**: Copy and save:
   - Access Key ID
   - Secret Access Key
   (You won't be able to see the secret key again!)

### Step 5: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# AWS S3 Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=AKIA...your-access-key
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-access-key
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=smri-learning-media
```

**Replace with your actual values!**

### Step 6: Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 🔒 Security Best Practices

### Custom IAM Policy (Recommended)

Instead of `AmazonS3FullAccess`, create a custom policy with minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::smri-learning-media/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::smri-learning-media"
    }
  ]
}
```

### CORS Configuration

If you need to upload directly from the browser, add CORS rules:

1. Go to your S3 bucket
2. **Permissions** tab → **CORS**
3. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## 📁 Folder Structure

The S3 bucket will have this structure:

```
smri-learning-media/
├── courses/
│   └── thumbnails/
│       ├── intro-to-ai-1234567890-abc123.jpg
│       └── web-dev-basics-1234567891-def456.png
├── lessons/
│   ├── videos/
│   │   ├── lesson-1-intro-1234567892-ghi789.mp4
│   │   └── lesson-2-basics-1234567893-jkl012.mp4
│   └── images/
│       ├── diagram-1-1234567894-mno345.png
│       └── screenshot-2-1234567895-pqr678.jpg
```

## 🧪 Testing the Setup

### Test Upload

1. Navigate to http://localhost:3000/admin/courses/create
2. Fill in course details
3. Upload a thumbnail image
4. Click "Create Course"
5. Check your S3 bucket to see the uploaded file

### Verify Public Access

After uploading, the file URL should be accessible:
```
https://smri-learning-media.s3.us-east-1.amazonaws.com/courses/thumbnails/filename.jpg
```

Open this URL in a browser - you should see the image.

## 💰 Cost Considerations

### S3 Pricing (as of 2024)

- **Storage**: ~$0.023 per GB/month
- **PUT requests**: $0.005 per 1,000 requests
- **GET requests**: $0.0004 per 1,000 requests
- **Data transfer OUT**: First 1 GB/month free, then $0.09 per GB

### Example Cost Estimate

For a small learning platform:
- 100 courses × 1MB thumbnail = 100 MB
- 500 lessons × 50MB video = 25 GB
- Total storage: ~25 GB = **~$0.58/month**
- 10,000 views/month = **~$0.004**
- **Total: ~$0.60/month**

### Cost Optimization Tips

1. **Use CloudFront CDN** for video delivery (reduces S3 data transfer costs)
2. **Compress images** before upload
3. **Use appropriate video codecs** (H.264 for compatibility)
4. **Set lifecycle policies** to archive old content

## 🔍 Troubleshooting

### Error: "Access Denied"

**Solution:**
- Check bucket policy allows public read
- Verify IAM user has correct permissions
- Ensure ACL is set to `public-read` on upload

### Error: "Bucket not found"

**Solution:**
- Verify bucket name in `.env.local` matches actual bucket
- Check region is correct
- Ensure bucket exists in your AWS account

### Error: "Invalid credentials"

**Solution:**
- Verify Access Key ID and Secret Access Key are correct
- Check IAM user has S3 permissions
- Ensure credentials are not expired

### Images not loading

**Solution:**
- Check bucket policy allows public access
- Verify CORS configuration if uploading from browser
- Check browser console for errors
- Verify URL format is correct

## 📚 Available Functions

### Upload Course Thumbnail
```javascript
import { uploadCourseThumbnail } from '@/lib/s3-upload';

const result = await uploadCourseThumbnail(file);
// Returns: { success: true, url: 'https://...', key: 'courses/thumbnails/...' }
```

### Upload Lesson Video
```javascript
import { uploadLessonVideo } from '@/lib/s3-upload';

const result = await uploadLessonVideo(videoFile);
```

### Upload Lesson Image
```javascript
import { uploadLessonImage } from '@/lib/s3-upload';

const result = await uploadLessonImage(imageFile);
```

### Validate Files
```javascript
import { validateImage, validateVideo } from '@/lib/s3-upload';

// Validate image (max 5MB by default)
const imageValidation = validateImage(file);
if (!imageValidation.valid) {
  console.error(imageValidation.error);
}

// Validate video (max 100MB by default)
const videoValidation = validateVideo(file, 200); // Custom 200MB limit
```

### Delete File
```javascript
import { deleteFromS3 } from '@/lib/s3-upload';

await deleteFromS3('courses/thumbnails/old-file.jpg');
```

## 🎯 Next Steps

1. ✅ Create AWS account
2. ✅ Create S3 bucket
3. ✅ Configure bucket policy
4. ✅ Create IAM user
5. ✅ Add credentials to `.env.local`
6. ✅ Restart dev server
7. ✅ Test upload via Create Course page
8. ⬜ Set up CloudFront (optional, for production)
9. ⬜ Configure lifecycle policies (optional)
10. ⬜ Set up monitoring/alerts (optional)

## 📖 Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [S3 Pricing Calculator](https://calculator.aws/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)

---

**Need help?** Check the AWS Console for detailed error messages or review the troubleshooting section above.
