const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000, // fail fast instead of hanging
      connectTimeoutMS: 8000,
    });
    console.log("MongoDB Connected Successfully 🚀");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error(
      "   Check: (1) your IP is whitelisted in Atlas Network Access, " +
      "(2) the cluster isn't paused, (3) MONGO_URI/password are correct, " +
      "(4) your network allows mongodb+srv DNS (SRV) lookups."
    );
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
