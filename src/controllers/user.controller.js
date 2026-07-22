const AuthService = require('../services/auth.service')
const PasswordResetService = require('../services/passwordReset.service')
const { generateToken } = require('../utils/generateToken')

/**
 * User Controller
 * Handles HTTP requests related to user management
 */
class UserController {
  /**
   * POST /login
   * Authenticate user and return JWT token
   */
  static async login(req, res) {
    try {
      const { emailUser, passwordUser } = req.body

      // Validate input
      if (!emailUser || !passwordUser) {
        return res.status(400).json({
          success: false,
          message: 'Email et mot de passe requis',
        })
      }

      // Attempt login
      const result = await AuthService.login(emailUser, passwordUser)

      res.status(200).json({
        success: true,
        message: 'Connexion réussie',
        data: result,
      })
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * POST /register/admin
   * Create the first admin user (bootstrapping - no authentication required)
   * This route is only available when no admin exists in the system
   */
  static async registerAdmin(req, res) {
    try {
      const { nameUser, emailUser, passwordUser } = req.body

      // Validate input
      if (!nameUser || !emailUser || !passwordUser) {
        return res.status(400).json({
          success: false,
          message: 'Nom, email et mot de passe requis',
        })
      }

      // Validate email format
      const emailRegex = /^\S+@\S+\.\S+$/
      if (!emailRegex.test(emailUser)) {
        return res.status(400).json({
          success: false,
          message: "Format d'email invalide",
        })
      }

      // Validate password length
      if (passwordUser.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 8 caractères',
        })
      }

      // Create admin user with ADMIN role, no forced password change
      const user = await AuthService.register(
        { nameUser, emailUser, passwordUser, roleUser: 'ADMIN' },
        false,
      )

      // Generate token for the new admin
      const token = generateToken(user)

      res.status(201).json({
        success: true,
        message: 'Administrateur créé avec succès',
        data: {
          user,
          token,
        },
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * POST /register
   * Register a new user (Admin only)
   */
  static async register(req, res) {
    try {
      const { nameUser, emailUser, passwordUser, roleUser, hospitalUser, specialtyUser } = req.body

      // Validate input
      if (!nameUser || !emailUser || !passwordUser) {
        return res.status(400).json({
          success: false,
          message: 'Nom, email et mot de passe requis',
        })
      }

      // Validate hospital for MEDECIN and ACCUEIL
      if ((roleUser === 'MEDECIN' || roleUser === 'ACCUEIL') && !hospitalUser) {
        return res.status(400).json({
          success: false,
          message: 'L\'hôpital est requis pour ce rôle',
        })
      }

      // Validate specialty for MEDECIN
      if (roleUser === 'MEDECIN' && !specialtyUser) {
        return res.status(400).json({
          success: false,
          message: 'La spécialité est requise pour un médecin',
        })
      }

      // Validate email format
      const emailRegex = /^\S+@\S+\.\S+$/
      if (!emailRegex.test(emailUser)) {
        return res.status(400).json({
          success: false,
          message: "Format d'email invalide",
        })
      }

      // Validate password length
      if (passwordUser.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 8 caractères',
        })
      }

      // Create user
      const user = await AuthService.register({ nameUser, emailUser, passwordUser, roleUser, hospitalUser, specialtyUser })

      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: user,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * GET /users
   * Get all users (Admin only)
   */
  static async getAllUsers(req, res) {
    try {
      const { roleUser, search } = req.query

      // Build filters
      const filters = {}
      if (roleUser) {
        filters.roleUser = roleUser
      }
      if (search) {
        filters.search = search
      }

      const users = await AuthService.getAllUsers(filters)

      res.status(200).json({
        success: true,
        message: `${users.length} utilisateur(s) trouvé(s)`,
        data: users,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * GET /users/:id
   * Get user by ID
   */
  static async getUserById(req, res) {
    try {
      const { id } = req.params
      const user = await AuthService.getUserById(id)

      res.status(200).json({
        success: true,
        message: 'Utilisateur trouvé',
        data: user,
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * PUT /users/:id
   * Update user
   */
  static async updateUser(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body

      // Only allow updating certain fields
      const allowedFields = ['nameUser', 'roleUser', 'hospitalUser', 'specialtyUser']
      const filteredData = {}

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field]
        }
      }

      // If update data is empty
      if (Object.keys(filteredData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Aucune donnée à mettre à jour',
        })
      }

      const user = await AuthService.updateUser(id, filteredData)

      res.status(200).json({
        success: true,
        message: 'Utilisateur mis à jour',
        data: user,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * DELETE /users/:id
   * Delete user (Admin only)
   */
  static async deleteUser(req, res) {
    try {
      const { id } = req.params

      // Prevent admin from deleting themselves
      if (id === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Vous ne pouvez pas supprimer votre propre compte',
        })
      }

      const user = await AuthService.deleteUser(id)

      res.status(200).json({
        success: true,
        message: 'Utilisateur supprimé',
        data: user,
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * POST /forgot-password
   * Request password reset
   */
  static async forgotPassword(req, res) {
    try {
      const { emailUser } = req.body

      console.log('🔐 [FORGOT PASSWORD] Requête reçue pour:', emailUser)

      if (!emailUser) {
        console.warn('⚠️ [FORGOT PASSWORD] Email manquant dans la requête')
        return res.status(400).json({
          success: false,
          message: 'Email requis',
        })
      }

      const result = await PasswordResetService.requestReset(emailUser)

      console.log('✅ [FORGOT PASSWORD] Résultat pour', emailUser, ':', result.message)

      res.status(200).json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      console.error('❌ [FORGOT PASSWORD] Erreur:', error.message)
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * GET /password-reset-requests
   * Get all password reset requests (Admin only)
   */
  static async getPasswordResetRequests(req, res) {
    try {
      const { filter } = req.query
      let requests

      if (filter === 'pending') {
        requests = await PasswordResetService.getPendingRequests()
      } else {
        requests = await PasswordResetService.getAllRequests()
      }

      res.status(200).json({
        success: true,
        data: requests,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * POST /approve-reset/:id
   * Approve password reset request (Admin only)
   */
  static async approveReset(req, res) {
    try {
      const { id } = req.params
      const adminId = req.user._id

      const result = await PasswordResetService.approveRequest(id, adminId)

      res.status(200).json({
        success: true,
        message: result.message,
        data: { emailUser: result.emailUser },
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * POST /reject-reset/:id
   * Reject password reset request (Admin only)
   */
  static async rejectReset(req, res) {
    try {
      const { id } = req.params
      const adminId = req.user._id

      await PasswordResetService.rejectRequest(id, adminId)

      res.status(200).json({
        success: true,
        message: 'Demande rejetée',
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * POST /change-password
   * Change user password (authenticated user)
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body
      const userId = req.user._id

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mot de passe actuel et nouveau mot de passe requis',
        })
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 8 caractères',
        })
      }

      if (!/[A-Z]/.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins une majuscule',
        })
      }

      if (!/[a-z]/.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins une minuscule',
        })
      }

      if (!/[0-9]/.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins un chiffre',
        })
      }

      if (!/[^A-Za-z0-9]/.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins un caractère spécial',
        })
      }

      await AuthService.changePassword(userId, currentPassword, newPassword)

      res.status(200).json({
        success: true,
        message: 'Mot de passe modifié avec succès',
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }
}

module.exports = UserController
