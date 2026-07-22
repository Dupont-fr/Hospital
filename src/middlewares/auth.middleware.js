const { verifyToken } = require('../utils/generateToken')
const { User } = require('../models/user.model')

/**
 * Authentication Middleware
 * Verifies the JWT token and adds user information to the request object
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization

    // Check if Authorization header exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Token requis.',
      })
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1]

    // Verify the token
    const decoded = verifyToken(token)

    // Find the user in database
    const user = await User.findById(decoded.id)

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    // Add user to request object
    req.user = user
    req.token = token

    next()
  } catch (error) {
    // Handle different error types
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
      })
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
      })
    }

    // Other errors
    return res.status(500).json({
      success: false,
      message: "Erreur d'authentification",
      error: error.message,
    })
  }
}

module.exports = authenticate
