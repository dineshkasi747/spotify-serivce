import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',  // Will be hashed automatically
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();