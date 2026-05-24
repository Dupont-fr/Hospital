const mongoose = require('mongoose')

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'hôpital est requis'],
    unique: true,
    trim: true,
  },
  services: [{
    type: String,
    trim: true,
  }],
})

hospitalSchema.index({ name: 1 })

module.exports = {
  Hospital: mongoose.model('Hospital', hospitalSchema),
}
