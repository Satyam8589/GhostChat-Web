import AuditLog from "../models/auditlogsModel.js";

export const logAuditEvent = async (userId, action, options = {}) => {
  try {
    const logData = {
      userId,
      action,
      severity: options.severity || getSeverityForAction(action),
      ipAddress: options.ipAddress || null,
      userAgent: options.userAgent || null,
      deviceId: options.deviceId || null,
      targetUserId: options.targetUserId || null,
      targetChatId: options.targetChatId || null,
      targetMessageId: options.targetMessageId || null,
      metadata: options.metadata || {},
      status: options.status || "success",
      errorMessage: options.errorMessage || null,
    };

    return await AuditLog.logEvent(logData);
  } catch (error) {
    console.error("Audit logging failed:", error);
    return null;
  }
};

const getSeverityForAction = (action) => {
  const severityMap = {
    screenshot_attempt: "critical",
    devtools_detected: "critical",
    suspicious_activity: "critical",
    account_locked: "high",
    failed_login: "medium",
    password_change: "medium",
    email_change: "medium",
    device_add: "medium",
    user_delete_account: "high",
    chat_delete: "medium",
    message_delete: "low",
    user_register: "low",
    user_login: "low",
    user_logout: "low",
    message_send: "low",
  };

  return severityMap[action] || "low";
};

export const getUserAuditLogs = async (userId, limit = 50) => {
  return await AuditLog.getUserLogs(userId, limit);
};

export const getSecurityAlerts = async (severity = "high", limit = 100) => {
  return await AuditLog.getSecurityAlerts(severity, limit);
};

export const getFailedLoginAttempts = async (hours = 24) => {
  return await AuditLog.getFailedLogins(hours);
};

export const getSuspiciousActivities = async (limit = 50) => {
  return await AuditLog.getSuspiciousActivity(limit);
};

export const reviewAuditLog = async (logId, reviewerId, notes) => {
  try {
    const log = await AuditLog.findById(logId);
    if (!log) {
      return null;
    }
    return await log.markAsReviewed(reviewerId, notes);
  } catch (error) {
    console.error("Review audit log failed:", error);
    return null;
  }
};
