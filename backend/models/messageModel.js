import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: [true, "Chat reference is required"],
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },

    encryptedContent: {
      type: String,
      required: [true, "Encrypted content is required"],
      trim: true,
    },

    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "file"],
      default: "text",
    },

    mediaUrl: {
      type: String,
      default: null,
    },

    fileName: {
      type: String,
      default: null,
    },

    fileSize: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    deliveredAt: {
      type: Date,
      default: null,
    },

    readAt: {
      type: Date,
      default: null,
    },

    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ isDeleted: 1 });

// Method to mark message as delivered
messageSchema.methods.markAsDelivered = function () {
  this.status = "delivered";
  this.deliveredAt = new Date();
  return this.save();
};

// Method to mark message as read
messageSchema.methods.markAsRead = function (userId) {
  if (!this.readBy.some(read => read.userId.toString() === userId.toString())) {
    this.readBy.push({ userId, readAt: new Date() });
    this.status = "read";
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to soft delete message
messageSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

const Message = mongoose.model("Message", messageSchema);

export default Message;
