const { ROLES } = require('../models/user.model')

/**
 * Role Middleware Factory
 * Creates a middleware that checks if the user has the required role(s)
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {Function} - Middleware function
 */
const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated (should be set by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise',
        })
      }

      // Get user's role
      const userRole = req.user.roleUser

      // Check if user's role is allowed
      const hasPermission = allowedRoles.includes(userRole)

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Accès refusé. Rôle '${userRole}' non autorisé pour cette action.`,
        })
      }

      // User has permission, proceed to next middleware
      next()
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur de vérification de rôle',
        error: error.message,
      })
    }
  }
}

/**
 * Middleware for ADMIN only routes
 * Provides full access to all operations
 */
const requireAdmin = allowRoles(ROLES.ADMIN)

/**
 * Middleware for MEDECIN and ADMIN roles
 * Allows access to medical-related operations
 */
const requireMedecin = allowRoles(ROLES.MEDECIN, ROLES.ADMIN)

/**
 * Middleware for ACCUEIL, MEDECIN and ADMIN roles
 * Allows access to patient registration operations
 */
const requireAccueil = allowRoles(ROLES.ACCUEIL, ROLES.MEDECIN, ROLES.ADMIN)

module.exports = {
  allowRoles,
  requireAdmin,
  requireMedecin,
  requireAccueil,
  ROLES,
}
