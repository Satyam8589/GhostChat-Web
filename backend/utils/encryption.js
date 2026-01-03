import crypto from "crypto";

// Algorithm for encryption
const ALGORITHM = "aes-256-cbc";

// Encryption key - in production, this should be in environment variables
// Key must be 32 bytes (256 bits) for AES-256
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ||
  crypto.randomBytes(32).toString("hex").slice(0, 32);

// IV length for AES
const IV_LENGTH = 16;

/**
 * Encrypt text using AES-256-CBC
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in format: iv:encryptedData
 */
export const encrypt = (text) => {
  try {
    if (!text) return text;

    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY),
      iv
    );

    // Encrypt the text
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Return IV and encrypted data separated by ':'
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
};

/**
 * Decrypt text using AES-256-CBC
 * @param {string} text - Encrypted text in format: iv:encryptedData or plain text
 * @returns {string} - Decrypted plain text
 */
export const decrypt = (text) => {
  try {
    if (!text) return text;

    // Convert to string if it's not already
    const textStr = String(text);

    // Check if text is in encrypted format (iv:encryptedData)
    const parts = textStr.split(":");

    // If not in encrypted format, assume it's plain text (old message)
    if (parts.length !== 2) {
      return textStr; // Return as-is for old unencrypted messages
    }

    // Validate hex format for IV and encrypted data
    const hexPattern = /^[0-9a-fA-F]+$/;
    if (!hexPattern.test(parts[0]) || !hexPattern.test(parts[1])) {
      // Check if it looks like it might be encrypted but has typos/corruption
      if (parts[0].length === 32 && parts[1].length > 32) {
        console.warn(
          `Possible corrupted encrypted message: IV length=${parts[0].length}, Data length=${parts[1].length}`
        );
      }
      return textStr; // Return as-is if not valid hex (plain text)
    }

    // Validate IV length (should be 16 bytes = 32 hex characters)
    if (parts[0].length !== 32) {
      console.warn(`Invalid IV length: ${parts[0].length}, expected 32`);
      return textStr;
    }

    // Try to decrypt
    const iv = Buffer.from(parts[0], "hex");
    const encryptedData = parts[1];

    // Create decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY),
      iv
    );

    // Decrypt the data
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    // If decryption fails, return original text (likely plain text from before encryption)
    console.warn(
      `Decryption failed for message (length: ${text?.length}), returning original. Error: ${error.message}`
    );
    return text;
  }
};

/**
 * Validate if encryption key is properly set
 * @returns {boolean}
 */
export const validateEncryptionKey = () => {
  if (!process.env.ENCRYPTION_KEY) {
    console.warn(
      "⚠️  WARNING: ENCRYPTION_KEY not set in environment variables. Using temporary key."
    );
    console.warn(
      "⚠️  Please set ENCRYPTION_KEY in .env file for production use."
    );
    return false;
  }

  if (process.env.ENCRYPTION_KEY.length !== 32) {
    console.error("❌ ENCRYPTION_KEY must be exactly 32 characters (256 bits)");
    return false;
  }

  return true;
};
