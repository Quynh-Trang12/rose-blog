/**
 * Hashes a plain-text password using the native Web Crypto API (SHA-256).
 * Returns a Promise that resolves to a lowercase hex string.
 * @param {string} password
 * @returns {Promise<string>}
 */
export function hashPassword(password) {
  var encoder = new TextEncoder()
  var data = encoder.encode(password)
  return window.crypto.subtle.digest('SHA-256', data).then(function (buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(function (b) { return b.toString(16).padStart(2, '0') })
      .join('')
  })
}
