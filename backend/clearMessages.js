import Message from "./models/messageModel.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Clear all messages
const clearMessages = async () => {
  try {
    await connectDB();
    
    console.log("🗑️  Deleting all messages...");
    const result = await Message.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} messages`);
    
    console.log("✨ Database cleaned successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing messages:", error);
    process.exit(1);
  }
};

clearMessages();
