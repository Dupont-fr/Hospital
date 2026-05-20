require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env'),
})

const connectDB = require('./config/db')
const { User, ROLES } = require('./models/user.model')
const { generateToken } = require('./utils/generateToken')

const users = [
  {
    name: 'Admin Principal',
    email: 'admin@hospital.com',
    password: 'Admin123!',
    role: ROLES.ADMIN,
  },
  {
    name: 'Dr. Jean Martin',
    email: 'medecin@hospital.com',
    password: 'Medecin123!',
    role: ROLES.MEDECIN,
  },
  {
    name: 'Marie Durant',
    email: 'accueil@hospital.com',
    password: 'Accueil123!',
    role: ROLES.ACCUEIL,
  },
]

const seed = async () => {
  try {
    await connectDB()
    console.log('\n🌱 Création des utilisateurs...\n')

    for (const userData of users) {
      const existing = await User.findOne({ email: userData.email })

      if (existing) {
        const token = generateToken(existing)
        console.log(`⚠️  ${userData.role} existe déjà : ${userData.email}`)
        console.log(`   Token: ${token}\n`)
        continue
      }

      const user = new User(userData)
      await user.save()
      const token = generateToken(user)

      console.log(`✅ ${userData.role} créé :`)
      console.log(`   Email: ${userData.email}`)
      console.log(`   Mot de passe: ${userData.password}`)
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
