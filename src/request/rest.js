/**
 * REST Request Handler
 * Permet de creer des utilisateurs via des requetes HTTP
 */

const express = require('express')
const path = require('path')

// Charger dotenv avec le bon chemin
require('dotenv').config({
  path: path.join(__dirname, '..', '..', '.env'),
})

const connectDB = require('../config/db')
const { User, ROLES } = require('../models/user.model')
const { generateToken } = require('../utils/generateToken')

// Create Express app pour les requetes
const requestApp = express()
requestApp.use(express.json())

/**
 * Validation du mot de passe
 * Au moins: 1 chiffre, 1 lettre, 1 caractere special
 */
const validatePassword = (password) => {
  const errors = []

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caracteres')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre')
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractere special')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validation de l'email
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * POST /create-user - Creer un nouvel utilisateur
 */
requestApp.post('/create-user', async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nom, email et mot de passe sont obligatoires',
      })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email invalide',
      })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe invalide',
        errors: passwordValidation.errors,
      })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est deja utilise',
      })
    }

    const allowedRoles = Object.values(ROLES)
    const userRole = role && allowedRoles.includes(role) ? role : ROLES.ACCUEIL

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
    })

    await newUser.save()

    const token = generateToken(newUser)

    res.status(201).json({
      success: true,
      message: `Utilisateur ${userRole} cree avec succes`,
      user: newUser.toJSON(),
      token,
    })
  } catch (error) {
    console.error('Erreur creation utilisateur:', error.message)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la creation',
      error: error.message,
    })
  }
})

/**
 * POST /create-admin - Creer un administrateur
 */
requestApp.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nom, email et mot de passe sont obligatoires',
      })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email invalide',
      })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe invalide',
        errors: passwordValidation.errors,
      })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est deja utilise',
      })
    }

    const admin = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: ROLES.ADMIN,
    })

    await admin.save()

    const token = generateToken(admin)

    res.status(201).json({
      success: true,
      message: 'Administrateur cree avec succes',
      user: admin.toJSON(),
      token,
    })
  } catch (error) {
    console.error('Erreur creation admin:', error.message)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la creation',
      error: error.message,
    })
  }
})

/**
 * POST /validate-password - Valider mot de passe
 */
requestApp.post('/validate-password', (req, res) => {
  const { password } = req.body

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Mot de passe requis',
    })
  }

  const validation = validatePassword(password)

  res.json({
    success: validation.valid,
    valid: validation.valid,
    errors: validation.errors,
  })
})

/**
 * POST /check-email - Verifier si email disponible
 */
requestApp.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis',
      })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Format email invalide',
      })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })

    res.json({
      success: true,
      valid: !existingUser,
      message: existingUser ? 'Email deja utilise' : 'Email disponible',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur verification email',
    })
  }
})

// Port hardcode pour les requetes
const REQUEST_PORT = 3005

/**
 * Demarrer le serveur de requetes
 */
const startRequestServer = async () => {
  try {
    await connectDB()
    console.log('MongoDB connecte pour les requetes')

    requestApp.listen(REQUEST_PORT, () => {
      console.log(`
==============================================
   Request Server running on port ${REQUEST_PORT}
   
   Routes:
   POST /create-user
   POST /create-admin
   POST /validate-password
   POST /check-email
==============================================
      `)
    })
  } catch (error) {
    console.error('Erreur:', error.message)
    process.exit(1)
  }
}

// Demarrer si execute directement
if (require.main === module) {
  startRequestServer()
}

module.exports = {
  requestApp,
  validatePassword,
  validateEmail,
  startRequestServer,
}
