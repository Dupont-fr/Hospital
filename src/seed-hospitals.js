require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env'),
})

const mongoose = require('mongoose')
const connectDB = require('./config/db')
const { Hospital } = require('./models/hospital.model')

const hospitals = [
  {
    name: "Hôpital de District de Dschang",
    services: ["Médecine générale", "Pédiatrie", "Maternité", "Urgences", "Laboratoire"],
  },
  {
    name: "Hôpital Central de Yaoundé",
    services: ["Cardiologie", "Neurologie", "Oncologie", "Chirurgie générale", "Radiologie", "Pédiatrie", "Urgences"],
  },
  {
    name: "Hôpital Général de Douala",
    services: ["Médecine interne", "Pédiatrie", "Gynécologie", "Ophtalmologie", "ORL", "Urgences"],
  },
  {
    name: "Hôpital Laquintinie de Douala",
    services: ["Pédiatrie", "Maternité", "Chirurgie", "Cardiologie", "Dermatologie"],
  },
  {
    name: "Hôpital Régional de Bafoussam",
    services: ["Médecine générale", "Pédiatrie", "Chirurgie", "Maternité", "Laboratoire"],
  },
  {
    name: "Hôpital Régional de Bamenda",
    services: ["Médecine générale", "Pédiatrie", "Chirurgie", "Maternité", "Urgences"],
  },
  {
    name: "Hôpital Régional de Maroua",
    services: ["Médecine générale", "Pédiatrie", "Maternité", "Ophtalmologie", "Laboratoire"],
  },
  {
    name: "Hôpital Régional de Garoua",
    services: ["Médecine générale", "Pédiatrie", "Chirurgie", "Maternité", "Urgences"],
  },
  {
    name: "Hôpital de District de Bafang",
    services: ["Médecine générale", "Pédiatrie", "Maternité", "Laboratoire"],
  },
  {
    name: "Hôpital de District de Mbouda",
    services: ["Médecine générale", "Pédiatrie", "Maternité", "Urgences"],
  },
  {
    name: "Hôpital de District de Foumban",
    services: ["Médecine générale", "Pédiatrie", "Maternité", "Laboratoire"],
  },
  {
    name: "Hôpital de District de Nkongsamba",
    services: ["Médecine générale", "Pédiatrie", "Maternité", "Ophtalmologie"],
  },
  {
    name: "Hôpital de District d'Ebolowa",
    services: ["Médecine générale", "Pédiatrie", "Maternité", "Urgences"],
  },
  {
    name: "Hôpital de District de Sangmélima",
    services: ["Médecine générale", "Pédiatrie", "Maternité", "Laboratoire"],
  },
  {
    name: "Hôpital de District de Kribi",
    services: ["Médecine générale", "Pédiatrie", "Urgences", "Laboratoire"],
  },
  {
    name: "Hôpital de District d'Edéa",
    services: ["Médecine générale", "Pédiatrie", "Maternité", "Urgences"],
  },
  {
    name: "Hôpital Adventiste de Nanga-Eboko",
    services: ["Médecine générale", "Pédiatrie", "Chirurgie", "Maternité", "Ophtalmologie"],
  },
  {
    name: "Centre Hospitalier Universitaire (CHU) de Yaoundé",
    services: ["Cardiologie", "Neurologie", "Oncologie", "Chirurgie cardiaque", "Néonatalogie", "Radiologie", "Pédiatrie"],
  },
  {
    name: "Centre Hospitalier Universitaire (CHU) de Douala",
    services: ["Médecine interne", "Chirurgie générale", "Pédiatrie", "Gynécologie", "Psychiatrie", "Urgences"],
  },
  {
    name: "Hôpital Militaire de Yaoundé",
    services: ["Médecine générale", "Chirurgie", "Orthopédie", "Radiologie", "Laboratoire"],
  },
]

const seed = async () => {
  try {
    await connectDB()
    console.log('\n🌱 Insertion des hôpitaux...\n')

    for (const hospitalData of hospitals) {
      const existing = await Hospital.findOne({ name: hospitalData.name })
      if (existing) {
        console.log(`⚠️  Déjà existant : ${hospitalData.name}`)
        continue
      }
      await Hospital.create(hospitalData)
      console.log(`✅ Ajouté : ${hospitalData.name}`)
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
