import multer from 'multer';
import path from 'path';

// Configure multer for memory storage (we'll upload directly to Cloudinary)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed audio formats
  const audioFormats = ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg'];
  
  // Allowed image formats
  const imageFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'audio') {
    // Check if audio file
    if (audioFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed (mp3, wav, m4a, flac, aac, ogg)'), false);
    }
  } else if (file.fieldname === 'image') {
    // Check if image file
    if (imageFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp)'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size for audio
  },
});

// Middleware for uploading song with audio and optional image
export const uploadSong = upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);

// Middleware for uploading only audio
export const uploadAudio = upload.single('audio');

// Middleware for uploading only image
export const uploadImage = upload.single('image');

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 50MB',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err) {
    // Other errors
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};