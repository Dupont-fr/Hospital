const https = require('https')

class EmailService {
  static async sendEmail(to, name, subject, htmlContent) {
    try {
      const apiKey = process.env.BREVO_API_KEY

      if (!apiKey || apiKey === 'votre_cle_api_brevo') {
        console.log(`📧 [SIMULATION] Email à ${to}: ${subject}`)
        return { success: true, message: 'Simulation' }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`📧 [DEV] Email envoyé à ${to}: ${subject}`)
        console.log(`   Destinataire: ${name} <${to}>`)
        console.log(`   Sujet: ${subject}`)
        return { success: true, message: 'Mode développement - email simulé' }
      }

      const data = JSON.stringify({
        sender: {
          email: process.env.BREVO_SENDER_EMAIL || 'noreply@hospital.com',
          name: process.env.BREVO_SENDER_NAME || 'MediSys',
        },
        to: [{ email: to, name: name }],
        subject: subject,
        htmlContent: htmlContent,
      })

      const result = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.brevo.com',
          path: '/v3/smtp/email',
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
          },
        }

        const req = https.request(options, (res) => {
          let body = ''
          res.on('data', (chunk) => { body += chunk })
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`📧 Email envoyé à ${to}: ${subject}`)
              resolve({ success: true, messageId: body ? JSON.parse(body).messageId : undefined })
            } else {
              console.error(`❌ BREVO ${res.statusCode}:`, body)
              reject(new Error(`BREVO ${res.statusCode} - ${body.substring(0, 200)}`))
            }
          })
        })

        req.on('error', reject)
        req.write(data)
        req.end()
      })

      return result
    } catch (error) {
      console.error('❌ Erreur envoi email:', error.message)
      return { success: false, message: error.message }
    }
  }

  static async sendTemporaryPassword(email, name, password, role) {
    const roleLabel = { ADMIN: 'Administrateur', MEDECIN: 'Médecin', ACCUEIL: "Agent d'accueil" }
    const subject = 'Votre compte MediSys a été créé'
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">MediSys</h1>
          <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">Gestion Hospitalière</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #1e293b; margin: 0 0 8px; font-size: 20px;">Bonjour ${name},</h2>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 20px;">
            Votre compte a été créé avec succès sur la plateforme MediSys.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px 14px; background: #f8fafc; border-radius: 8px 0 0 8px; color: #64748b; font-size: 14px; width: 120px;">Rôle</td>
              <td style="padding: 10px 14px; background: #f8fafc; border-radius: 0 8px 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${roleLabel[role] || role}</td>
            </tr>
          </table>
          <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="color: #92400e; margin: 0 0 8px; font-size: 14px; font-weight: 600;">🔑 Votre mot de passe provisoire</p>
            <div style="background: #ffffff; border: 1px dashed #d97706; border-radius: 6px; padding: 12px; text-align: center; font-family: 'Courier New', monospace; font-size: 18px; font-weight: 700; color: #92400e; letter-spacing: 2px;">${password}</div>
            <p style="color: #92400e; margin: 12px 0 0; font-size: 13px;">
              Pour des raisons de sécurité, vous devrez changer ce mot de passe lors de votre première connexion.
            </p>
          </div>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="display: block; text-align: center; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px; border-radius: 8px; font-weight: 600; font-size: 15px;">Se connecter à MediSys</a>
        </div>
        <div style="background: #f8fafc; padding: 20px 24px; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
            Cet email a été envoyé automatiquement par MediSys. Merci de ne pas y répondre.
          </p>
        </div>
      </div>
    `

    return this.sendEmail(email, name, subject, htmlContent)
  }

  static async sendPasswordChangedConfirmation(email, name) {
    const subject = 'Mot de passe mis à jour - MediSys'
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">MediSys</h1>
          <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">Gestion Hospitalière</p>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
          <div style="width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <span style="font-size: 32px;">✓</span>
          </div>
          <h2 style="color: #1e293b; margin: 0 0 8px; font-size: 20px;">Mot de passe mis à jour</h2>
          <p style="color: #475569; line-height: 1.6; margin: 0;">
            Bonjour ${name},<br>
            Votre mot de passe a été modifié avec succès.
          </p>
        </div>
        <div style="background: #f8fafc; padding: 20px 24px; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
            Si vous n'êtes pas à l'origine de cette modification, contactez immédiatement votre administrateur.
          </p>
        </div>
      </div>
    `

    return this.sendEmail(email, name, subject, htmlContent)
  }

  static async sendLoginNotification(email, name, role) {
    const roleLabel = { ADMIN: 'Administrateur', MEDECIN: 'Médecin', ACCUEIL: "Agent d'accueil" }
    const now = new Date()
    const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    const subject = 'Connexion détectée - MediSys'
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">MediSys</h1>
          <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">Gestion Hospitalière</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #1e293b; margin: 0 0 8px; font-size: 20px;">Bonjour ${name},</h2>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 20px;">
            Une connexion a été détectée sur votre compte <strong>${roleLabel[role] || role}</strong>.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
            <tr>
              <td style="padding: 10px 14px; background: #f8fafc; border-radius: 8px 0 0 8px; color: #64748b; font-size: 14px; width: 120px;">Date</td>
              <td style="padding: 10px 14px; background: #f8fafc; border-radius: 0 8px 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${dateStr}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; background: #f8fafc; border-radius: 8px 0 0 8px; color: #64748b; font-size: 14px; width: 120px;">Heure</td>
              <td style="padding: 10px 14px; background: #f8fafc; border-radius: 0 8px 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${timeStr}</td>
            </tr>
          </table>
          <p style="color: #94a3b8; font-size: 13px; margin: 16px 0 0;">
            Si vous ne reconnaissez pas cette connexion, veuillez contacter votre administrateur immédiatement.
          </p>
        </div>
        <div style="background: #f8fafc; padding: 20px 24px; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
            Cet email est envoyé automatiquement à chaque connexion sur votre compte MediSys.
          </p>
        </div>
      </div>
    `

    return this.sendEmail(email, name, subject, htmlContent)
  }
}

module.exports = EmailService
