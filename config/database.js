import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in your .env file');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Check if password placeholder exists
    if (MONGODB_URI.includes('<db_password>')) {
      throw new Error('Please replace <db_password> with your actual MongoDB password in .env file');
    }

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
      
      // Provide helpful error messages
      if (error.message.includes('authentication failed')) {
        console.error('\n💡 Troubleshooting tips:');
        console.error('   1. Check if username and password are correct in .env file');
        console.error('   2. Verify MongoDB Atlas user has proper permissions');
        console.error('   3. Check if your IP is whitelisted in MongoDB Atlas Network Access');
        console.error('   4. If password has special characters, they need to be URL-encoded');
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        console.error('\n💡 Network error: Check your internet connection and MongoDB Atlas cluster status');
      } else if (error.message.includes('whitelist') || error.reason?.type === 'ReplicaSetNoPrimary') {
        console.error('\n🔒 IP Whitelist Error:');
        console.error('   Your server IP is not whitelisted in MongoDB Atlas.');
        console.error('   This is common when deploying to Render, Vercel, or other cloud platforms.');
        console.error('\n   📋 To fix this:');
        console.error('   1. Go to MongoDB Atlas Dashboard');
        console.error('   2. Navigate to: Network Access → Add IP Address');
        console.error('   3. For Render deployment, add: 0.0.0.0/0 (Allow access from anywhere)');
        console.error('      ⚠️  Note: This allows all IPs. For production, consider whitelisting specific IPs.');
        console.error('   4. Wait 1-2 minutes for changes to propagate');
        console.error('   5. Restart your Render service');
        console.error('\n   🔗 Direct link: https://cloud.mongodb.com/v2#/security/network/list');
      }
      
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

