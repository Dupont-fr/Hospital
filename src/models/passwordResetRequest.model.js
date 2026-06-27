const mongoose = require('mongoose')

const passwordResetRequestSchema = new mongoose.Schema({
  emailUser: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  nameUser: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  temporaryPassword: {
    type: String,
    default: null,
    select: false,
  },
}, { timestamps: true })

passwordResetRequestSchema.index({ status: 1, createdAt: -1 })

module.exports = mongoose.model('PasswordResetRequest', passwordResetRequestSchema)
