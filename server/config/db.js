const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI || mongoURI.trim() === '') {
    console.error('------------------------------------------------------------');
    console.error('ERROR: Missing MongoDB Connection String!');
    console.error('Add your MongoDB Atlas connection string to server/.env as MONGO_URI.');
    console.error('------------------------------------------------------------');
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('Add your MongoDB Atlas connection string to server/.env as MONGO_URI.');
    return null;
  }
};

module.exports = connectDB;
