
const { S3Client, CreateBucketCommand, PutBucketCorsCommand, PutPublicAccessBlockCommand, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env vars manually since we are running this script directly
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Fallback to strict check
if (!envConfig.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || envConfig.NEXT_PUBLIC_AWS_ACCESS_KEY_ID.includes('your-aws-access-key')) {
  console.error("❌ Error: Valid AWS Credentials not found in .env.local.");
  console.error("Please update .env.local with real AWS Access Key ID and Secret Access Key.");
  process.exit(1);
}

const REGION = envConfig.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
const BUCKET_NAME = 'smri-mock-bucket';

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: envConfig.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: envConfig.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
});

async function createBucket() {
  console.log(`Attempting to create bucket: ${BUCKET_NAME} in ${REGION}...`);

  try {
    // 1. Create Bucket
    await s3Client.send(new CreateBucketCommand({
      Bucket: BUCKET_NAME,
    }));
    console.log(`✅ Bucket '${BUCKET_NAME}' created successfully.`);

    // 2. Configure CORS (to allow browser uploads)
    const corsConfig = {
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: ["*"], // For development; restrict in prod
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3000
          }
        ]
      }
    };
    await s3Client.send(new PutBucketCorsCommand(corsConfig));
    console.log("✅ CORS configured.");

    // 3. Unblock Public Access (so we can attach a public policy)
    await s3Client.send(new PutPublicAccessBlockCommand({
      Bucket: BUCKET_NAME,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false
      }
    }));
    console.log("✅ Public access unblocked.");

    // 4. Add Bucket Policy for Public Read
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
        }
      ]
    };
    
    await s3Client.send(new PutBucketPolicyCommand({
        Bucket: BUCKET_NAME,
        Policy: JSON.stringify(policy)
    }));
    console.log("✅ Bucket policy attached (Public Read).");

    console.log("\n🎉 Setup Complete! Don't forget to update your NEXT_PUBLIC_AWS_S3_BUCKET_NAME in .env.local");

  } catch (err) {
    if (err.name === 'BucketAlreadyExists') {
        console.log(`⚠️ Bucket '${BUCKET_NAME}' already exists (owned by someone else). Pick a unique name.`);
    } else if (err.name === 'BucketAlreadyOwnedByYou') {
        console.log(`ℹ️ Bucket '${BUCKET_NAME}' already exists and is owned by you.`);
    } else {
        console.error("❌ Error creating bucket:", err);
    }
  }
}

createBucket();
