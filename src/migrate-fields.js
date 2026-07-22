require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env'),
})

const mongoose = require('mongoose')
const connectDB = require('./config/db')

const migrate = async () => {
  try {
    await connectDB()

    const db = mongoose.connection.db

    // 1. Supprimer les anciens indexes (cause de l'erreur E11000)
    await db.collection('users').dropIndex('email_1').catch(() => {})
    await db.collection('users').dropIndex('role_1').catch(() => {})
    console.log('🗑️  Anciens indexes supprimés (users)')

    // 2. Migrer les utilisateurs : name → nameUser, etc.
    const usersResult = await db.collection('users').updateMany(
      { name: { $exists: true } },
      {
        $rename: {
          name: 'nameUser',
          email: 'emailUser',
          password: 'passwordUser',
          role: 'roleUser',
          mustChangePassword: 'mustChangePasswordUser',
          hospital: 'hospitalUser',
          specialty: 'specialtyUser',
          createdAt: 'createdAtUser',
        },
      },
    )
    console.log(`✅ Utilisateurs migrés : ${usersResult.modifiedCount} document(s)`)

    // 3. Supprimer les indexes hôpitaux
    await db.collection('hospitals').dropIndex('name_1').catch(() => {})
    console.log('🗑️  Anciens indexes supprimés (hospitals)')

    // 4. Migrer les hôpitaux
    const hospitalsResult = await db.collection('hospitals').updateMany(
      { name: { $exists: true } },
      {
        $rename: {
          name: 'nameHospital',
          services: 'servicesHospital',
        },
      },
    )
    console.log(`✅ Hôpitaux migrés : ${hospitalsResult.modifiedCount} document(s)`)

    console.log('\n🎉 Migration terminée avec succès')
    console.log('📌 Les nouveaux indexes seront créés automatiquement au prochain démarrage du service')
  } catch (error) {
    console.error('❌ Erreur de migration:', error.message)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Déconnecté de MongoDB')
    process.exit(0)
  }
}

migrate()
