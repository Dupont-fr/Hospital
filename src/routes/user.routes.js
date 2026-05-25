const express = require('express')
const router = express.Router()

// Import controller
const UserController = require('../controllers/user.controller')

// Import middlewares
const authenticate = require('../middlewares/auth.middleware')
const { allowRoles, requireAdmin } = require('../middlewares/role.middleware')

/**
 * User Routes
 * All routes are prefixed with /api/users when mounted on the gateway
 */

// ======================
// Public Routes
// ======================

/**
 * POST /register/admin
 * Create the first admin user (bootstrapping)
 * Access: Public (no authentication required)
 * Note: This route is only available when no admin exists in the system
 */
router.post('/register/admin', UserController.registerAdmin)

/**
 * POST /login
 * Authenticate user and get JWT token
 * Access: Public (no authentication required)
 */
router.post('/login', UserController.login)

// ======================
// Protected Routes
// ======================

/**
 * POST /change-password
 * Change own password
 * Access: Authenticated user
 */
router.post('/change-password', authenticate, UserController.changePassword)

/**
 * POST /register
 * Create a new user
 * Access: ADMIN only
 */
router.post('/register', authenticate, requireAdmin, UserController.register)

/**
 * GET /users
 * Get all users
 * Access: ADMIN only
 */
router.get('/users', authenticate, requireAdmin, UserController.getAllUsers)

/**
 * GET /users/:id
 * Get user by ID
 * Access: ADMIN and the user themselves
 */
router.get('/users/:id', authenticate, allowRoles('ADMIN', 'MEDECIN'), UserController.getUserById)

/**
 * PUT /users/:id
 * Update user
 * Access: ADMIN only
 */
router.put(
  '/users/:id',
  authenticate,
  requireAdmin,
  UserController.updateUser,
)

/**
 * DELETE /users/:id
 * Delete user
 * Access: ADMIN only
 */
router.delete('/users/:id', authenticate, requireAdmin, UserController.deleteUser)

module.exports = router
