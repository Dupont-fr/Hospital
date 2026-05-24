const { Hospital } = require('../models/hospital.model')

class HospitalController {
  static async getAll(req, res) {
    try {
      const { search } = req.query
      const filter = {}
      if (search) {
        filter.name = { $regex: search, $options: 'i' }
      }
      const hospitals = await Hospital.find(filter).sort({ name: 1 })
      res.status(200).json({
        success: true,
        data: hospitals,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  static async getById(req, res) {
    try {
      const hospital = await Hospital.findById(req.params.id)
      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: 'Hôpital non trouvé',
        })
      }
      res.status(200).json({
        success: true,
        data: hospital,
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      })
    }
  }

  static async create(req, res) {
    try {
      const { name, services } = req.body
      const hospital = await Hospital.create({ name, services })
      res.status(201).json({
        success: true,
        data: hospital,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }
}

module.exports = HospitalController
