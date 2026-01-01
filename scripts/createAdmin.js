import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

// Create admin user
async function createAdminUser() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@nhanstudio.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user (password will be hashed by pre-save hook)
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@nhanstudio.com',
      password: 'admin123', // Will be hashed automatically
      role: 'Me'
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@nhanstudio.com');
    console.log('Password: admin123');
    console.log('Role: Me');
    console.log('\n⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();

