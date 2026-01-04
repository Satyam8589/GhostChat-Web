/**
 * Device Fingerprinting Utility
 * Generates a unique device ID for each browser/device
 * Stores it in localStorage for persistence
 */

/**
 * Generate a unique device ID
 * @returns {string} Unique device ID
 */
const generateDeviceId = () => {
  // Create a unique ID based on browser characteristics
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const userAgent = navigator.userAgent;
  
  // Simple hash function
  const hash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  };
  
  const fingerprint = hash(userAgent + navigator.language + screen.width + screen.height);
  
  return `device_${fingerprint}_${random}_${timestamp}`;
};

/**
 * Get or create device ID
 * @returns {string} Device ID
 */
export const getDeviceId = () => {
  // Check if deviceId already exists in localStorage
  let deviceId = localStorage.getItem('deviceId');
  
  if (!deviceId) {
    // Generate new deviceId if it doesn't exist
    deviceId = generateDeviceId();
    localStorage.setItem('deviceId', deviceId);
  }
  
  return deviceId;
};

/**
 * Get device name (browser + OS)
 * @returns {string} Device name
 */
export const getDeviceName = () => {
  const userAgent = navigator.userAgent;
  
  // Detect browser
  let browser = 'Unknown Browser';
  if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
    browser = 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    browser = 'Safari';
  } else if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
  } else if (userAgent.indexOf('Edg') > -1) {
    browser = 'Edge';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    browser = 'Opera';
  }
  
  // Detect OS
  let os = 'Unknown OS';
  if (userAgent.indexOf('Win') > -1) {
    os = 'Windows';
  } else if (userAgent.indexOf('Mac') > -1) {
    os = 'macOS';
  } else if (userAgent.indexOf('Linux') > -1) {
    os = 'Linux';
  } else if (userAgent.indexOf('Android') > -1) {
    os = 'Android';
  } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
    os = 'iOS';
  }
  
  return `${browser} on ${os}`;
};

/**
 * Get device fingerprint (for additional security)
 * @returns {string} Device fingerprint
 */
export const getDeviceFingerprint = () => {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform,
  ].join('|');
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * Clear device ID (for logout)
 */
export const clearDeviceId = () => {
  localStorage.removeItem('deviceId');
};

/**
 * Get all device info
 * @returns {Object} Device information
 */
export const getDeviceInfo = () => {
  return {
    deviceId: getDeviceId(),
    deviceName: getDeviceName(),
    fingerprint: getDeviceFingerprint(),
  };
};

export default {
  getDeviceId,
  getDeviceName,
  getDeviceFingerprint,
  clearDeviceId,
  getDeviceInfo,
};
