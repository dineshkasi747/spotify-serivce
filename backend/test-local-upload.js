import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Testing Cloudinary connection with LOCAL file...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set ✓' : 'Missing ✗');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set ✓' : 'Missing ✗');
console.log('');

// Check if music-files directory exists
const musicFilesDir = path.join(__dirname, 'music-files');
if (!fs.existsSync(musicFilesDir)) {
  console.error('❌ music-files directory not found!');
  process.exit(1);
}

// Get first MP3 file
const musicFiles = fs.readdirSync(musicFilesDir).filter(file => 
  file.endsWith('.mp3')
);

if (musicFiles.length === 0) {
  console.error('❌ No MP3 files found in music-files directory!');
  process.exit(1);
}

const testFile = path.join(musicFilesDir, musicFiles[0]);
console.log(`📁 Testing with file: ${musicFiles[0]}`);
console.log('');

// Test upload
cloudinary.uploader.upload(testFile, {
  resource_type: 'video',
  folder: 'test-upload',
  format: 'mp3',
})
.then(result => {
  console.log('✅ Cloudinary working!');
  console.log('🎵 Audio uploaded successfully!');
  console.log('📍 URL:', result.secure_url);
  console.log('🆔 Public ID:', result.public_id);
  console.log('');
  console.log('🎉 Your Cloudinary setup is working! You can now run: npm run seed');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Cloudinary error:');
  console.error('   Message:', err.message);
  console.error('   HTTP Code:', err.http_code);
  console.error('');
  console.error('🔍 Possible issues:');
  console.error('   1. Check your Cloudinary credentials in .env');
  console.error('   2. Verify your Cloudinary account is active');
  console.error('   3. Check if you have upload permissions');
  console.error('   4. Try disabling antivirus/firewall temporarily');
  console.error('');
  console.error('Full error:', err);
  process.exit(1);
});