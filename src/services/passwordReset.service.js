const PasswordResetRequest = require('../models/passwordResetRequest.model')
const { User } = require('../models/user.model')
const EmailService = require('./email.service')
const crypto = require('crypto')

class PasswordResetService {
  static async requestReset(email) {
    const user = await User.findOne({ emailUser: email })
    if (!user) {
      return { success: true, message: 'Si cet email existe, une demande a été envoyée aux administrateurs.' }
    }

    const existingPending = await PasswordResetRequest.findOne({ emailUser: email, status: 'pending' })
    if (existingPending) {
      return { success: true, message: 'Une demande est déjà en cours pour cet email.' }
    }

    await PasswordResetRequest.create({
      emailUser: user.emailUser,
      nameUser: user.nameUser,
    })

    const admins = await User.find({ roleUser: 'ADMIN' })
    for (const admin of admins) {
      try {
        await EmailService.sendResetRequestNotification(
          admin.emailUser,
          admin.nameUser,
          user.nameUser,
          user.emailUser,
        )
      } catch (err) {
        console.log('Note: Email de notification non envoyé à', admin.emailUser)
      }
    }

    return { success: true, message: 'Si cet email existe, une demande a été envoyée aux administrateurs.' }
  }

  static async getPendingRequests() {
    const requests = await PasswordResetRequest.find({ status: 'pending' })
      .sort({ createdAt: -1 })
    return requests
  }

  static async getAllRequests() {
    const requests = await PasswordResetRequest.find()
      .sort({ createdAt: -1 })
      .populate('approvedBy', 'nameUser emailUser')
    return requests
  }

  static async approveRequest(requestId, adminId) {
    const request = await PasswordResetRequest.findById(requestId)
    if (!request) throw new Error('Demande introuvable')
    if (request.status !== 'pending') throw new Error('Cette demande a déjà été traitée')

    const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase() + '!Aa1'

    const admin = await User.findById(adminId)
    if (!admin) throw new Error('Administrateur non trouvé')

    request.status = 'approved'
    request.approvedBy = adminId
    request.approvedAt = new Date()
    request.temporaryPassword = tempPassword
    await request.save()

    const user = await User.findOne({ emailUser: request.emailUser })
    if (user) {
      user.passwordUser = tempPassword
      user.mustChangePasswordUser = true
      await user.save()

      try {
        await EmailService.sendPasswordResetEmail(
          user.emailUser,
          user.nameUser,
          tempPassword,
        )
      } catch (err) {
        console.log('Note: Email de mot de passe temporaire non envoyé')
      }
    }

    return { success: true, message: 'Mot de passe réinitialisé avec succès', emailUser: request.emailUser }
  }

  static async rejectRequest(requestId, adminId) {
    const request = await PasswordResetRequest.findById(requestId)
    if (!request) throw new Error('Demande introuvable')
    if (request.status !== 'pending') throw new Error('Cette demande a déjà été traitée')

    request.status = 'rejected'
    request.approvedBy = adminId
    request.approvedAt = new Date()
    await request.save()

    return { success: true, message: 'Demande rejetée' }
  }
}

module.exports = PasswordResetService
