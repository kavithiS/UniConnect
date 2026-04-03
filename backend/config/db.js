const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

const connectDB = async () => {
  try {
    console.log("Attempting MongoDB connection...");

    // Try Atlas connection first if MONGODB_URI is set
    const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (atlasUri && !process.env.USE_MEMORY_DB) {
      try {
        console.log("Trying MongoDB connection...");
        const conn = await mongoose.connect(atlasUri, {
          serverSelectionTimeoutMS: 5000, // Fail fast if Atlas unavailable
        });
        console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (atlasError) {
        console.log("⚠ MongoDB connection failed:", atlasError.message);
        console.log("→ Falling back to other options...\n");
      }
    }

    // Try local MongoDB (persistent) before using memory DB
    if (!process.env.USE_MEMORY_DB) {
      try {
        const localUri = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/uniconnect";
        console.log(`Trying local MongoDB connection: ${localUri}`);
        const conn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`✓ Local MongoDB Connected: ${conn.connection.host}`);
        console.log("→ Using persistent local database\n");
        return conn;
      } catch (localError) {
        console.log("⚠ Local MongoDB connection failed:", localError.message);
        console.log("→ Falling back to in-memory MongoDB for development...\n");
      }
    }

    // Fall back to in-memory MongoDB for development
    console.log("Starting MongoDB Memory Server (in-memory database)...");
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const conn = await mongoose.connect(mongoUri);
    console.log(`✓ MongoDB Memory Server Connected: ${conn.connection.host}`);
    console.log("→ Using in-memory database (data will be lost on restart)");
    console.log("→ Perfect for development and testing!\n");

    return conn;
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error.message);
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

// Cleanup function for graceful shutdown
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      console.log("MongoDB Memory Server stopped");
    }
  } catch (error) {
    console.error("Error during DB disconnect:", error);
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
