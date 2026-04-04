/**
 * ==========================================
 * FILE: utils/crypto.js
 * ==========================================
 * Description:
 * Provides a SHA-256 password hashing utility using the native Web Crypto API.
 * This module is imported by the Vuex auth module to hash passwords during
 * login and registration before comparing them against stored hashes.
 */

/**
 * Hashes a plain-text password using the native Web Crypto API (SHA-256).
 * Explanation: The Web Crypto API's subtle.digest method performs the hash
 * asynchronously. The resulting ArrayBuffer is then converted to a lowercase
 * hexadecimal string for storage and comparison.
 * @param {string} password - The plain-text password to hash
 * @returns {Promise<string>} A Promise resolving to a 64-character hex string
 */
export const hashPassword = async (password) => {
  // Explanation: TextEncoder converts the string to a Uint8Array of UTF-8 bytes.
  const encoder = new TextEncoder()
  const data = encoder.encode(password)

  // Explanation: digest() returns an ArrayBuffer containing the raw SHA-256 hash.
  const buffer = await window.crypto.subtle.digest('SHA-256', data)

  // Explanation: Convert each byte of the hash to a two-character hex string,
  // then join them into a single 64-character lowercase hex digest.
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
