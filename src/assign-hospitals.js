require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const mongoose = require('mongoose')
const connectDB = require('./config/db')
const { User, SPECIALTIES } = require('./models/user.model')
const { Hospital } = require('./models/hospital.model')

const assign = async () => {
  try {
    await connectDB()

    const hospitals = await Hospital.find().select('nameHospital').lean()
    if (hospitals.length === 0) {
      console.log('Aucun hôpital trouvé dans la base. Lancez d\'abord seed-hospitals.js')
      await mongoose.connection.close()
      process.exit(1)
    }
    const hospitalNames = hospitals.map(h => h.nameHospital)

    const noHospital = await User.find({ roleUser: { $in: ['MEDECIN', 'ACCUEIL'] }, hospitalUser: { $in: [null, ''] } })
    for (const u of noHospital) {
      const random = hospitalNames[Math.floor(Math.random() * hospitalNames.length)]
      await User.updateOne({ _id: u._id }, { $set: { hospitalUser: random } })
      console.log(`\u2705 H\u00f4pital: ${u.nameUser || u.emailUser} \u2192 ${random}`)
    }
    console.log(`\n${noHospital.length} utilisateur(s) sans h\u00f4pital assign\u00e9(s).`)

    const noSpecialty = await User.find({ roleUser: 'MEDECIN', specialtyUser: { $in: [null, ''] } })
    for (const u of noSpecialty) {
      const random = SPECIALTIES[Math.floor(Math.random() * SPECIALTIES.length)]
      await User.updateOne({ _id: u._id }, { $set: { specialtyUser: random } })
      console.log(`\u2705 Sp\u00e9cialit\u00e9: ${u.nameUser || u.emailUser} \u2192 ${random}`)
    }
    console.log(`\n${noSpecialty.length} m\u00e9decin(s) sans sp\u00e9cialit\u00e9 assign\u00e9(s).`)
  } catch (error) {
    console.error('Erreur:', error.message)
  } finally {
    await mongoose.connection.close()
    process.exit(0)
  }
}

assign()
