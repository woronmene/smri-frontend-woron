
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
let content = '';

try {
  content = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.log('No .env.local found, creating new one.');
}

const key = 'NEXT_PUBLIC_AWS_S3_BUCKET_NAME';
const value = 'smri-mock-bucket';
const regex = new RegExp(`^${key}=.*`, 'm');

if (regex.test(content)) {
  content = content.replace(regex, `${key}=${value}`);
  console.log('Updated existing bucket name.');
} else {
  content += `\n${key}=${value}\n`;
  console.log('Appended bucket name.');
}

fs.writeFileSync(envPath, content);
console.log('Successfully updated .env.local');
