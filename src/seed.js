require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env'),
})

const connectDB = require('./config/db')
const { User, ROLES } = require('./models/user.model')
const { generateToken } = require('./utils/generateToken')

const users = [
  {
    nameUser: 'Admin Principal',
    emailUser: 'admin@hospital.com',
    passwordUser: 'Admin123!',
    roleUser: ROLES.ADMIN,
  },
  {
    nameUser: 'Dr. Jean Martin',
    emailUser: 'medecin@hospital.com',
    passwordUser: 'Medecin123!',
    roleUser: ROLES.MEDECIN,
  },
  {
    nameUser: 'Marie Durant',
    emailUser: 'accueil@hospital.com',
    passwordUser: 'Accueil123!',
    roleUser: ROLES.ACCUEIL,
  },
]

const seed = async () => {
  try {
    await connectDB()
    console.log('\n🌱 Création des utilisateurs...\n')

    for (const userData of users) {
      const existing = await User.findOne({ emailUser: userData.emailUser })

      if (existing) {
        const token = generateToken(existing)
        console.log(`⚠️  ${userData.roleUser} existe déjà : ${userData.emailUser}`)
        console.log(`   Token: ${token}\n`)
        continue
      }

      const user = new User(userData)
      await user.save()
      const token = generateToken(user)

      console.log(`✅ ${userData.roleUser} créé :`)
      console.log(`   Email: ${userData.emailUser}`)
      console.log(`   Mot de passe: ${userData.passwordUser}`)
      console.log(`   Token: ${token}\n`)
    }

    console.log('📋 Résumé :')
    console.log('   POST /api/users/login avec email + password pour obtenir un token')
    console.log('   Ou utilisez les tokens ci-dessus directement.\n')
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Déconnecté de MongoDB')
    process.exit(0)
  }
}

const mongoose = require('mongoose')
seed()
