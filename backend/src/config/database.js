const mongoose = require('mongoose');
require('dotenv').config(); // Load dotenv here as backup

const connectDB = async () => {
  try {
    // Debug: Show what MONGODB_URI is
    console.log('🔍 Checking MONGODB_URI...');
    console.log('MONGODB_URI value:', process.env.MONGODB_URI);
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('💡 Make sure your .env file exists at: backend/.env');
    console.error('💡 And contains: MONGODB_URI=mongodb://localhost:27017/job_portal_db');
    process.exit(1);
  }
};

module.exports = connectDB;