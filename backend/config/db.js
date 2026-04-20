const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

const connectDB = async () => {
  try {
    console.log("Attempting MongoDB connection...");

    // Prefer a persistent MongoDB connection first.
    const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (atlasUri) {
      try {
        console.log("Trying MongoDB connection...");
        const conn = await mongoose.connect(atlasUri, {
          serverSelectionTimeoutMS: 5000, // Fail fast if Atlas unavailable
        });
        console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (atlasError) {
        console.log("⚠ MongoDB connection failed:", atlasError.message);
        console.log("→ Falling back to local MongoDB...\n");
      }
    }

    // Try local MongoDB (persistent) next.
    try {
      const localUri =
        process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/uniconnect";
      console.log(`Trying local MongoDB connection: ${localUri}`);
      const conn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✓ Local MongoDB Connected: ${conn.connection.host}`);
      console.log("→ Using persistent local database\n");
      return conn;
    } catch (localError) {
      console.log("⚠ Local MongoDB connection failed:", localError.message);
    }

    if (!process.env.USE_MEMORY_DB) {
      throw new Error(
        "No persistent MongoDB connection available. Set MONGODB_URI or start local MongoDB.",
      );
    }

    // Fall back to in-memory MongoDB only when explicitly requested.
    console.log("Starting MongoDB Memory Server (in-memory database)...");
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const conn = await mongoose.connect(mongoUri);
    console.log(`✓ MongoDB Memory Server Connected: ${conn.connection.host}`);
    console.log("→ Using in-memory database (data will be lost on restart)");
    console.log("→ Explicitly enabled via USE_MEMORY_DB\n");

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
