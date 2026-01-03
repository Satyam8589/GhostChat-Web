import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "../models/messageModel.js";

dotenv.config();

const clearEncryptedMessages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Delete all messages (or you can just update them to a placeholder)
    const result = await Message.deleteMany({});

    console.log(`✅ Deleted ${result.deletedCount} old encrypted messages`);
    console.log("Users can now send new messages with the new encryption key");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

clearEncryptedMessages();
