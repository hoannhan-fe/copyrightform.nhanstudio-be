import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

// Check if password placeholder exists
if (MONGODB_URI.includes('<db_password>')) {
  console.error('❌ Please replace <db_password> with your actual MongoDB password in .env file');
  console.error('   Example: mongodb+srv://username:YOUR_PASSWORD@cluster.mongodb.net/...');
  process.exit(1);
}

console.log('🔍 Testing MongoDB connection...');
console.log('   Connection string format looks OK');

// Try to connect
console.log('   Attempting to connect...\n');

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000
})
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    console.log('   Database:', mongoose.connection.db.databaseName);
    console.log('   Ready state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to connect to MongoDB:\n');
    
    if (error.message.includes('authentication failed') || error.code === 8000) {
      console.error('   🔐 Authentication Error:');
      console.error('   Please verify:');
      console.error('   1. Username: nhanhoan679_db_user');
      console.error('   2. Password is correct (currently set in .env)');
      console.error('   3. Database user exists and has proper permissions in MongoDB Atlas');
      console.error('   4. If password has special characters (@, #, $, etc.), they need URL-encoding');
      console.error('\n   📝 Common URL-encoded characters:');
      console.error('      @ → %40');
      console.error('      # → %23');
      console.error('      $ → %24');
      console.error('      % → %25');
      console.error('      & → %26');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('   🌐 Network Error:');
      console.error('   - Check your internet connection');
      console.error('   - Verify MongoDB Atlas cluster is running');
      console.error('   - Check if your IP is whitelisted in MongoDB Atlas Network Access');
    } else if (error.message.includes('timeout')) {
      console.error('   ⏱️  Connection Timeout:');
      console.error('   - Check your internet connection');
      console.error('   - Verify MongoDB Atlas cluster is accessible');
      console.error('   - Check firewall settings');
    } else {
      console.error('   Error:', error.message);
      console.error('   Code:', error.code || 'N/A');
    }
    
    console.error('\n   Full error details:', error.message);
    process.exit(1);
  });

