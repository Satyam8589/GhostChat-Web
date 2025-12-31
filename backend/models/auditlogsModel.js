import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    action: {
      type: String,
      required: [true, "Action is required"],
      enum: [
        "user_register",
        "user_login",
        "user_logout",
        "user_update_profile",
        "user_delete_account",
        "chat_create",
        "chat_delete",
        "chat_add_member",
        "chat_remove_member",
        "message_send",
        "message_delete",
        "message_edit",
        "file_upload",
        "file_download",
        "screenshot_attempt",
        "devtools_detected",
        "suspicious_activity",
        "password_change",
        "email_change",
        "device_add",
        "device_remove",
        "failed_login",
        "account_locked",
        "account_unlocked",
      ],
      index: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
      index: true,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    deviceId: {
      type: String,
      default: null,
    },

    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    targetChatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      default: null,
    },

    targetMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    status: {
      type: String,
      enum: ["success", "failure", "pending"],
      default: "success",
    },

    errorMessage: {
      type: String,
      default: null,
    },

    location: {
      country: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    isReviewed: {
      type: Boolean,
      default: false,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ isReviewed: 1 });
auditLogSchema.index({ createdAt: -1 });

auditLogSchema.statics.logEvent = async function(data) {
  try {
    const log = new this({
      userId: data.userId,
      action: data.action,
      severity: data.severity || "low",
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      deviceId: data.deviceId || null,
      targetUserId: data.targetUserId || null,
      targetChatId: data.targetChatId || null,
      targetMessageId: data.targetMessageId || null,
      metadata: data.metadata || {},
      status: data.status || "success",
      errorMessage: data.errorMessage || null,
    });
    
    await log.save();
    return log;
  } catch (error) {
    console.error("Audit log error:", error);
    return null;
  }
};

auditLogSchema.statics.getUserLogs = async function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("targetUserId", "username email")
    .populate("targetChatId", "name type")
    .populate("targetMessageId", "messageType createdAt");
};

auditLogSchema.statics.getSecurityAlerts = async function(severity = "high", limit = 100) {
  return this.find({
    severity: { $in: severity === "high" ? ["high", "critical"] : [severity] },
    isReviewed: false,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "username email");
};

auditLogSchema.statics.getActionLogs = async function(action, limit = 100) {
  return this.find({ action })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "username email");
};

auditLogSchema.statics.getFailedLogins = async function(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.find({
    action: "failed_login",
    createdAt: { $gte: since },
  })
    .sort({ createdAt: -1 })
    .populate("userId", "username email");
};

auditLogSchema.statics.getSuspiciousActivity = async function(limit = 50) {
  return this.find({
    $or: [
      { action: "screenshot_attempt" },
      { action: "devtools_detected" },
      { action: "suspicious_activity" },
      { severity: "critical" },
    ],
    isReviewed: false,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "username email");
};

auditLogSchema.methods.markAsReviewed = function(reviewerId, notes) {
  this.isReviewed = true;
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.notes = notes || null;
  return this.save();
};

auditLogSchema.methods.addNote = function(note) {
  this.notes = note;
  return this.save();
};

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
