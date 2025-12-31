import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      required: [true, "Chat type is required"],
    },

    name: {
      type: String,
      required: function() {
        return this.type === "group";
      },
      trim: true,
      maxlength: [100, "Chat name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function() {
        return this.type === "group";
      },
    },

    groupKey: {
      type: String,
      required: function() {
        return this.type === "group";
      },
    },

    groupIcon: {
      type: String,
      default: null,
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    lastMessageTime: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    settings: {
      allowMediaSharing: {
        type: Boolean,
        default: true,
      },
      allowMemberAdd: {
        type: Boolean,
        default: true,
      },
      messageExpiration: {
        type: Number,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ participants: 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ lastMessageTime: -1 });
chatSchema.index({ isActive: 1 });

chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(
    (participantId) => participantId.toString() === userId.toString()
  );
};

chatSchema.methods.isAdmin = function(userId) {
  return this.admin && this.admin.toString() === userId.toString();
};

chatSchema.methods.addParticipant = function(userId) {
  if (!this.isParticipant(userId)) {
    this.participants.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

chatSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    (participantId) => participantId.toString() !== userId.toString()
  );
  return this.save();
};

chatSchema.methods.getParticipantCount = function() {
  return this.participants.length;
};

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
