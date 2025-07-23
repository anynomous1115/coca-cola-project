const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");

// Load environment variables
dotenv.config();

async function testConnection() {
  try {
    console.log("🔌 Testing database connection...");

    await connectDB();
    console.log("✅ Database connected successfully!");

    // Test basic operations
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`📋 Found ${collections.length} collections in database`);

    // Show connection info
    console.log(`🏷️  Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(
      `🔗 Connection state: ${
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
      }`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

testConnection();
