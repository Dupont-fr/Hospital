const mongoose = require('mongoose')

const hospitalSchema = new mongoose.Schema({
  nameHospital: {
    type: String,
    required: [true, 'Le nom de l\'hôpital est requis'],
    unique: true,
    trim: true,
  },
  servicesHospital: [{
    type: String,
    trim: true,
  }],
})

module.exports = {
  Hospital: mongoose.model('Hospital', hospitalSchema),
}
