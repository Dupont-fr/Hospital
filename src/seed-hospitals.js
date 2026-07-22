require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env'),
})

const mongoose = require('mongoose')
const connectDB = require('./config/db')
const { Hospital } = require('./models/hospital.model')

const hospitals = [
  { nameHospital: "Bafoussam Regional Hospital", servicesHospital: ["Médecine générale", "Pédiatrie", "Chirurgie", "Maternité", "Urgences", "Laboratoire"] },
  { nameHospital: "Hôpital de District de Bafang", servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Laboratoire"] },
  { nameHospital: "Hôpital de District de Bandja", servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité"] },
  { nameHospital: "Hôpital de District de Bamendjou", servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité"] },
  { nameHospital: "Hôpital de District de Bangangté", servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Urgences"] },
  { nameHospital: "Hôpital de District de Bandjoun", servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Laboratoire"] },
  { nameHospital: "Hôpital de District de Bangourain", servicesHospital: ["Médecine générale", "Pédiatrie"] },
  { nameHospital: "Hôpital de District de Batcham", servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité"] },
  { nameHospital: "Hôpital de District de Dschang", servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Urgences", "Laboratoire"] },
  { nameHospital: "Hôpital de District de Foumban", servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Laboratoire"] },
  { nameHospital: "Hôpital de District de Foumbot", servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité"] },
  { nameHospital: "Hôpital de District de Galim", servicesHospital: ["Médecine générale", "Pédiatrie"] },
  { nameHospital: "Hôpital de District de Kékem", servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Laboratoire"] },
  { nameHospital: "Hôpital de District de Kouoptamo", servicesHospital: ["Médecine générale", "Pédiatrie"] },
  { nameHospital: "Hôpital de District de Malantouen", servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité"] },
  { nameHospital: "Hôpital de District de Massangam", servicesHospital: ["Médecine générale", "Pédiatrie"] },
  { nameHospital: "Hôpital de District de Mbouda", servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Urgences"] },
  { nameHospital: "Hôpital de District de Penka Michel", servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité"] },
  { nameHospital: "Hôpital de District de Santchou", servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Laboratoire"] },
]

const seed = async () => {
  try {
    await connectDB()
    console.log('\n🌱 Insertion des hôpitaux...\n')

    for (const hospitalData of hospitals) {
      const existing = await Hospital.findOne({ nameHospital: hospitalData.nameHospital })
      if (existing) {
        console.log(`⚠️  Déjà existant : ${hospitalData.nameHospital}`)
        continue
      }
      await Hospital.create(hospitalData)
      console.log(`✅ Ajouté : ${hospitalData.nameHospital}`)
    }

    console.log(`\n📋 Total : ${hospitals.length} hôpitaux`)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Déconnecté de MongoDB\n')
    process.exit(0)
  }
}

seed()
