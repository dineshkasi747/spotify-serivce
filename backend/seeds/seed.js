import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Song from '../models/Song.js';

// ES6 module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configure Cloudinary after loading env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('☁️ Cloudinary configured');
console.log('📝 Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('🔑 API Key:', process.env.CLOUDINARY_API_KEY ? 'Set ✓' : 'Missing ✗');
console.log('🔐 API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set ✓' : 'Missing ✗');

// Function to upload a single song
const uploadSingleSong = async (songData, audioFilePath) => {
  try {
    console.log(`📤 Uploading: ${songData.title} by ${songData.artist}...`);

    // Upload audio to Cloudinary
    const audioUpload = await cloudinary.uploader.upload(audioFilePath, {
      resource_type: 'video',
      folder: 'music-player/audio',
      format: 'mp3',
    });

    // Use imageUrl directly instead of uploading (avoid DNS issues)
    let imageUrl = songData.imageUrl || '';
    
    // Create song in database
    const song = await Song.create({
      title: songData.title,
      artist: songData.artist,
      album: songData.album || '',
      genre: songData.genre,
      duration: songData.duration || 0,
      releaseYear: songData.releaseYear || new Date().getFullYear(),
      audioUrl: audioUpload.secure_url,
      imageUrl: imageUrl,
      cloudinaryPublicId: {
        audio: audioUpload.public_id,
        image: '',
      },
      features: {
        danceability: songData.danceability || 0.5,
        energy: songData.energy || 0.5,
        acousticness: songData.acousticness || 0.5,
        instrumentalness: songData.instrumentalness || 0.5,
        valence: songData.valence || 0.5,
        tempo: songData.tempo || 120,
        speechiness: songData.speechiness || 0.5,
        liveness: songData.liveness || 0.5,
        loudness: songData.loudness || -10,
      },
    });

    console.log(`✅ Uploaded: ${song.title}`);
    return song;
  } catch (error) {
    console.error(`❌ Failed to upload ${songData.title}:`);
    console.error(`   Error: ${error.message}`);
    if (error.http_code) {
      console.error(`   Cloudinary Error Code: ${error.http_code}`);
    }
    console.error(`   Full error:`, error);
    return null;
  }
};

// Main seed function
const seedSongs = async () => {
  try {
    console.log('');
    console.log('='.repeat(60));
    console.log('🎵 Starting Music Seeding Process...');
    console.log('='.repeat(60));
    console.log('');

    // Connect to database first
    await connectDB();
    console.log('✅ Database connected');
    console.log('');

    // Load songs metadata from JSON
    const songsDataPath = path.join(__dirname, 'songs200.json');
    
    if (!fs.existsSync(songsDataPath)) {
      console.error('❌ songs200.json not found!');
      console.log('Please create seeds/songs200.json with your song metadata');
      process.exit(1);
    }

    const songsData = JSON.parse(fs.readFileSync(songsDataPath, 'utf-8'));
    console.log(`📋 Loaded ${songsData.length} songs from JSON`);

    // Check music-files directory
    const musicFilesDir = path.join(__dirname, '..', 'music-files');
    
    if (!fs.existsSync(musicFilesDir)) {
      console.error('❌ music-files directory not found!');
      console.log('Please create music-files/ directory and add your MP3 files');
      process.exit(1);
    }

    const musicFiles = fs.readdirSync(musicFilesDir).filter(file => 
      file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.m4a')
    );

    console.log(`🎼 Found ${musicFiles.length} audio files`);
    console.log('');

    // Clear existing songs (optional - comment out if you want to keep existing)
    const deleteExisting = process.argv.includes('--clear');
    if (deleteExisting) {
      console.log('🗑️  Clearing existing songs...');
      await Song.deleteMany({});
      console.log('✅ Existing songs cleared');
      console.log('');
    }

    // Upload songs
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < songsData.length && i < musicFiles.length; i++) {
      const songData = songsData[i];
      const audioFilePath = path.join(musicFilesDir, musicFiles[i]);

      const result = await uploadSingleSong(songData, audioFilePath);
      
      if (result) {
        successCount++;
      } else {
        failCount++;
      }

      // Progress indicator
      console.log(`📊 Progress: ${i + 1}/${Math.min(songsData.length, musicFiles.length)}`);
      console.log('');
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('🎉 Seeding Complete!');
    console.log('='.repeat(60));
    console.log(`✅ Successfully uploaded: ${successCount} songs`);
    console.log(`❌ Failed uploads: ${failCount} songs`);
    console.log('='.repeat(60));
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seed
seedSongs();