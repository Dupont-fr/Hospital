const { User, ROLES } = require('../models/user.model')
const { generateToken } = require('../utils/generateToken')
const EmailService = require('./email.service')

/**
 * Service d'authentification
 * Gère toutes les opérations liées à l'authentification
 */
class AuthService {
  /**
   * Connexion d'un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe de l'utilisateur
   * @returns {Object} - Utilisateur et token
   */
  static async login(email, password) {
    // Rechercher l'utilisateur par email
    const user = await User.findOne({ emailUser }).select('+passwordUser')

    // Vérifier si l'utilisateur existe
    if (!user) {
      throw new Error('Email ou mot de passe incorrect')
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw new Error('Email ou mot de passe incorrect')
    }

    // Générer le token JWT
    const token = generateToken(user)

    // Envoyer un email de notification de connexion
    try {
      await EmailService.sendLoginNotification(user.emailUser, user.nameUser, user.roleUser)
    } catch (emailError) {
      console.log('Note: Email de connexion non envoyé')
    }

    // Retourner les informations de l'utilisateur
    return {
      user: user.toJSON(),
      token,
      mustChangePassword: user.mustChangePasswordUser,
    }
  }

  /**
   * Enregistrer un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @param {boolean} requirePasswordChange - Forcer le changement de mot de passe (défaut: true)
   * @returns {Object} - Utilisateur créé
   */
  static async register(userData, requirePasswordChange = true) {
    const { nameUser, emailUser, passwordUser, roleUser, hospitalUser, specialtyUser } = userData

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ emailUser })
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé')
    }

    // Valider le rôle si fourni
    if (roleUser && !Object.values(ROLES).includes(roleUser)) {
      throw new Error('Rôle invalide')
    }

    // Créer le nouvel utilisateur
    const user = new User({
      nameUser,
      emailUser,
      passwordUser,
      roleUser: roleUser || ROLES.ACCUEIL,
      hospitalUser: hospitalUser || null,
      specialtyUser: specialtyUser || null,
      mustChangePasswordUser: requirePasswordChange,
    })

    // Sauvegarder dans la base de données
    await user.save()

    // Envoyer un email avec le mot de passe provisoire
    try {
      await EmailService.sendTemporaryPassword(emailUser, nameUser, passwordUser, user.roleUser)
    } catch (emailError) {
      console.log('Note: Email de bienvenue non envoyé')
    }

    // Retourner sans le mot de passe
    return user.toJSON()
  }

  /**
   * Obtenir un utilisateur par ID
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} - Utilisateur
   */
  static async getUserById(userId) {
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }
    return user
  }

  /**
   * Obtenir tous les utilisateurs
   * @param {Object} filters - Filtres optionnels
   * @returns {Array} - Tableau d'utilisateurs
   */
  static async getAllUsers(filters = {}) {
    const { search, ...otherFilters } = filters

    const query = { ...otherFilters }

    if (search) {
      query.$or = [
        { nameUser: { $regex: search, $options: 'i' } },
        { emailUser: { $regex: search, $options: 'i' } },
      ]
    }

    const users = await User.find(query).sort({ createdAtUser: -1 })
    return users
  }

  /**
   * Mettre à jour un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Object} - Utilisateur mis à jour
   */
  static async updateUser(userId, updateData) {
    // Ne pas autoriser la mise à jour du mot de passe par cette méthode
    const { passwordUser, ...validUpdates } = updateData

    // Si le rôle est mis à jour, le valider
    if (
      validUpdates.roleUser &&
      !Object.values(ROLES).includes(validUpdates.roleUser)
    ) {
      throw new Error('Rôle invalide')
    }

    const user = await User.findByIdAndUpdate(userId, validUpdates, {
      new: true,
      runValidators: true,
    })

    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }

    return user
  }

  /**
   * Supprimer un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} - Utilisateur supprimé
   */
  static async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId)

    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }

    return user
  }

  /**
   * Changer le mot de passe
   * @param {string} userId - ID de l'utilisateur
   * @param {string} currentPassword - Mot de passe actuel
   * @param {string} newPassword - Nouveau mot de passe
   * @returns {Object} - Utilisateur mis à jour
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+passwordUser')

    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      throw new Error('Mot de passe actuel incorrect')
    }

    user.passwordUser = newPassword
    user.mustChangePasswordUser = false
    await user.save()

    // Envoyer un email de confirmation
    try {
      await EmailService.sendPasswordChangedConfirmation(user.emailUser, user.nameUser)
    } catch (emailError) {
      console.log('Note: Email de confirmation non envoyé')
    }

    return user.toJSON()
  }
}

module.exports = AuthService
