const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const SPECIALTIES = [
  'Médecine générale',
  'Pédiatrie',
  'Cardiologie',
  'Gastroentérologie',
  'Ophtalmologie',
  'Dermatologie',
  'Gynécologie',
  'Neurologie',
  'Psychiatrie',
  'Radiologie',
  'Chirurgie générale',
  'Orthopédie',
  'Oto-rhino-laryngologie (ORL)',
  'Pneumologie',
  'Rhumatologie',
  'Urologie',
  'Anesthésiologie',
  'Oncologie',
  'Néonatologie',
  'Endocrinologie',
  'Hématologie',
  'Néphrologie',
  'Médecine d\'urgence',
  'Médecine interne',
  'Laboratoire',
  'Scanner',
  'Imagerie',
  'Échographie',
]

const ROLES = {
  ADMIN: 'ADMIN',
  MEDECIN: 'MEDECIN',
  ACCUEIL: 'ACCUEIL',
}

const userSchema = new mongoose.Schema({
  nameUser: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
  },

  emailUser: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },

  passwordUser: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },

  roleUser: {
    type: String,
    enum: ['ADMIN', 'MEDECIN', 'ACCUEIL'],
    default: 'ACCUEIL',
  },

  mustChangePasswordUser: {
    type: Boolean,
    default: false,
  },

  hospitalUser: {
    type: String,
    default: null,
  },

  specialtyUser: {
    type: String,
    enum: [...SPECIALTIES, null],
    default: null,
  },

  createdAtUser: {
    type: Date,
    default: Date.now,
  },
})

userSchema.index({ roleUser: 1 })

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordUser')) {
    return next()
  }

  const salt = await bcrypt.genSalt(10)
  this.passwordUser = await bcrypt.hash(this.passwordUser, salt)
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordUser)
}

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.passwordUser
  return obj
}

module.exports = {
  User: mongoose.model('User', userSchema),
  ROLES,
  SPECIALTIES,
}
