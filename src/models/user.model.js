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
]

// Define the roles available in the system
const ROLES = {
  ADMIN: 'ADMIN',
  MEDECIN: 'MEDECIN',
  ACCUEIL: 'ACCUEIL',
}

// User Schema
const userSchema = new mongoose.Schema({
  // User's full name
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
  },

  // User's email (unique identifier)
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },

  // User's password (hashed)
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // Exclude password from queries by default
  },

  // User's role in the system
  role: {
    type: String,
    enum: ['ADMIN', 'MEDECIN', 'ACCUEIL'],
    default: 'ACCUEIL',
  },

  // Force password change on first login
  mustChangePassword: {
    type: Boolean,
    default: false,
  },

  // Hospital (free text - user can type any name)
  hospital: {
    type: String,
    default: null,
  },

  // Medical specialty (for MEDECIN role)
  specialty: {
    type: String,
    enum: [...SPECIALTIES, null],
    default: null,
  },

  // Timestamp for creation
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for faster queries
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  // Only hash the password if it's modified
  if (!this.isModified('password')) {
    return next()
  }

  // Hash the password with bcrypt
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Method to exclude sensitive fields from JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

// Export the model and roles
module.exports = {
  User: mongoose.model('User', userSchema),
  ROLES,
  SPECIALTIES,
}
