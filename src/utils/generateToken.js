const jwt = require('jsonwebtoken')

/**
 * Generate a JWT token for a user
 * @param {Object} user - The user object to encode in the token
 * @returns {string} - The generated JWT token
 */
const generateToken = (user) => {
  // Create payload with user information
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  }

  // Sign the token with JWT_SECRET and expiration time
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  })

  return token
}

/**
 * Verify a JWT token
 * @param {string} token - The token to verify
 * @returns {Object} - The decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = {
  generateToken,
  verifyToken,
}
