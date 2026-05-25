require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env'),
})

const mongoose = require('mongoose')
const connectDB = require('./config/db')
const { Hospital } = require('./models/hospital.model')

const hospitals = [
  {
    nameHospital: "Hôpital de District de Dschang",
    servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Urgences", "Laboratoire"],
  },
  {
    nameHospital: "Hôpital Central de Yaoundé",
    servicesHospital: ["Cardiologie", "Neurologie", "Oncologie", "Chirurgie générale", "Radiologie", "Pédiatrie", "Urgences"],
  },
  {
    nameHospital: "Hôpital Général de Douala",
    servicesHospital: ["Médecine interne", "Pédiatrie", "Gynécologie", "Ophtalmologie", "ORL", "Urgences"],
  },
  {
    nameHospital: "Hôpital Laquintinie de Douala",
    servicesHospital: ["Pédiatrie", "Maternité", "Chirurgie", "Cardiologie", "Dermatologie"],
  },
  {
    nameHospital: "Hôpital Régional de Bafoussam",
    servicesHospital: ["Médecine générale", "Pédiatrie", "Chirurgie", "Maternité", "Laboratoire"],
  },
  {
    nameHospital: "Hôpital Régional de Bamenda",
    servicesHospital: ["Médecine générale", "Pédiatrie", "Chirurgie", "Maternité", "Urgences"],
  },
  {
    nameHospital: "Hôpital Régional de Maroua",
    servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Ophtalmologie", "Laboratoire"],
  },
  {
    nameHospital: "Hôpital Régional de Garoua",
    servicesHospital: ["Médecine générale", "Pédiatrie", "Chirurgie", "Maternité", "Urgences"],
  },
  {
    nameHospital: "Hôpital de District de Bafang",
    servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Laboratoire"],
  },
  {
    nameHospital: "Hôpital de District de Mbouda",
    servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Urgences"],
  },
  {
    nameHospital: "Hôpital de District de Foumban",
    servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Laboratoire"],
  },
  {
    nameHospital: "Hôpital de District de Nkongsamba",
    servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Ophtalmologie"],
  },
  {
    nameHospital: "Hôpital de District d'Ebolowa",
    servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Urgences"],
  },
  {
    nameHospital: "Hôpital de District de Sangmélima",
    servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Laboratoire"],
  },
  {
    nameHospital: "Hôpital de District de Kribi",
    servicesHospital: ["Médecine générale", "Pédiatrie", "Urgences", "Laboratoire"],
  },
  {
    nameHospital: "Hôpital de District d'Edéa",
    servicesHospital: ["Médecine générale", "Pédiatrie", "Maternité", "Urgences"],
  },
  {
    nameHospital: "Hôpital Adventiste de Nanga-Eboko",
    servicesHospital: ["Médecine générale", "Pédiatrie", "Chirurgie", "Maternité", "Ophtalmologie"],
  },
  {
    nameHospital: "Centre Hospitalier Universitaire (CHU) de Yaoundé",
    servicesHospital: ["Cardiologie", "Neurologie", "Oncologie", "Chirurgie cardiaque", "Néonatalogie", "Radiologie", "Pédiatrie"],
  },
  {
    nameHospital: "Centre Hospitalier Universitaire (CHU) de Douala",
    servicesHospital: ["Médecine interne", "Chirurgie générale", "Pédiatrie", "Gynécologie", "Psychiatrie", "Urgences"],
  },
  {
    nameHospital: "Hôpital Militaire de Yaoundé",
    servicesHospital: ["Médecine générale", "Chirurgie", "Orthopédie", "Radiologie", "Laboratoire"],
  },
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
