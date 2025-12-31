import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: [true, "Chat ID is required"],
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
    },

    messageType: {
      type: String,
      enum: ["text", "image", "file", "audio", "video"],
      required: [true, "Message type is required"],
      default: "text",
    },

    encryptedContent: {
      type: String,
      required: [true, "Encrypted content is required"],
    },

    mediaUrl: {
      type: String,
      default: null,
    },

    metadata: {
      fileName: {
        type: String,
        default: null,
      },
      fileSize: {
        type: Number,
        default: null,
      },
      mimeType: {
        type: String,
        default: null,
      },
      duration: {
        type: Number,
        default: null,
      },
      dimensions: {
        width: Number,
        height: Number,
      },
      iv: {
        type: String,
        default: null,
      },
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

    deliveredTo: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        deliveredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
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

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ isDeleted: 1 });
messageSchema.index({ expiresAt: 1 });

messageSchema.methods.markAsRead = function(userId) {
  const alreadyRead = this.readBy.some(
    (read) => read.userId.toString() === userId.toString()
  );

  if (!alreadyRead) {
    this.readBy.push({
      userId,
      readAt: new Date(),
    });
    return this.save();
  }
  return Promise.resolve(this);
};

messageSchema.methods.markAsDelivered = function(userId) {
  const alreadyDelivered = this.deliveredTo.some(
    (delivery) => delivery.userId.toString() === userId.toString()
  );

  if (!alreadyDelivered) {
    this.deliveredTo.push({
      userId,
      deliveredAt: new Date(),
    });
    return this.save();
  }
  return Promise.resolve(this);
};

messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(
    (read) => read.userId.toString() === userId.toString()
  );
};

messageSchema.methods.isDeliveredTo = function(userId) {
  return this.deliveredTo.some(
    (delivery) => delivery.userId.toString() === userId.toString()
  );
};

messageSchema.methods.softDelete = function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

messageSchema.methods.getReadCount = function() {
  return this.readBy.length;
};

messageSchema.methods.getDeliveryCount = function() {
  return this.deliveredTo.length;
};

const Message = mongoose.model("Message", messageSchema);

export default Message;
