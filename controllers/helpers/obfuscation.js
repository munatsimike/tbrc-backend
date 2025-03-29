import crypto from "crypto";

const CONSISTENT_SALT = 'houston-we-have-a-problem'; // Replace with your consistent salt value
const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.scryptSync(CONSISTENT_SALT, 'salt', 32); // Generate a key from the salt
const IV = Buffer.alloc(16, 0); // Initialization vector
const enable = true;
/**
 * Encodes a string to a Base64 URL-safe string.
 * @param {string} str - The string to encode.
 * @returns {string} - The Base64 URL-safe encoded string.
 */
function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decodes a Base64 URL-safe string to a regular string.
 * @param {string} str - The Base64 URL-safe encoded string.
 * @returns {string} - The decoded string.
 */
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString();
}

/**
 * Obfuscates the ID using AES encryption and Base64 URL-safe encoding.
 * @param {string | number} id - The ID to obfuscate.
 * @returns {string} - The obfuscated ID.
 */
export function obfuscateId(id) {
  if (!enable) {
    return id;
  }
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
  let encrypted = cipher.update(id.toString(), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return base64UrlEncode(encrypted);
}

export function obfuscateArray(data) {
  if (!enable) {
    return data;
  }
  return data.map((item) => {
    if (item.id) {
      item.id = obfuscateId(item.id);
    }
    if(item.budget_id){
      item.budget_id = obfuscateId(item.budget_id);
    }
    if(item.user_id){
      item.user_id = obfuscateId(item.user_id);
    }
    return item;
  });
}

/**
 * De-obfuscates the ID using Base64 URL-safe decoding and AES decryption.
 * @param {string} obfuscatedId - The obfuscated ID to decode.
 * @returns {string} - The original ID.
 */
export function deobfuscateId(obfuscatedId) {
  if (!enable) {
    return obfuscatedId;
  }
  const decoded = base64UrlDecode(obfuscatedId);
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, IV);
  let decrypted = decipher.update(decoded, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function obfuscateUserId(userId) {
  return obfuscateId(userId);
}

export function deobfuscateUserId(obfuscatedUserId) {
  return deobfuscateId(obfuscatedUserId);
}