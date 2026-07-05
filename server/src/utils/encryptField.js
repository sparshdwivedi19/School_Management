const CryptoJS = require('crypto-js');

const SECRET = process.env.FIELD_ENCRYPT_SECRET || 'suncity-field-secret-32chars!!';

/**
 * Encrypt a field value (AES-256 via CryptoJS)
 */
const encrypt = (plaintext) => {
  if (!plaintext) return plaintext;
  return CryptoJS.AES.encrypt(String(plaintext), SECRET).toString();
};

/**
 * Decrypt a field value
 */
const decrypt = (ciphertext) => {
  if (!ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return ciphertext; // return as-is if not encrypted
  }
};

module.exports = { encrypt, decrypt };
