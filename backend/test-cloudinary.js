import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Testing Cloudinary connection...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set ✓' : 'Missing ✗');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set ✓' : 'Missing ✗');

// Test upload
cloudinary.uploader.upload('https://via.placeholder.com/150', {
  folder: 'test',
})
.then(result => {
  console.log('✅ Cloudinary working!');
  console.log('Test image URL:', result.secure_url);
})
.catch(err => {
  console.error('❌ Cloudinary error:', err);
});