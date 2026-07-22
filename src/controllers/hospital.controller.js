const { Hospital } = require('../models/hospital.model')

class HospitalController {
  static async getAll(req, res) {
    try {
      const { search } = req.query
      const filter = {}
      if (search) {
        filter.nameHospital = { $regex: search, $options: 'i' }
      }
      const hospitals = await Hospital.find(filter).sort({ nameHospital: 1 })
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
      const { nameHospital, servicesHospital } = req.body
      const hospital = await Hospital.create({ nameHospital, servicesHospital })
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

  static async update(req, res) {
    try {
      const { nameHospital, servicesHospital } = req.body
      const hospital = await Hospital.findByIdAndUpdate(
        req.params.id,
        { nameHospital, servicesHospital },
        { new: true, runValidators: true },
      )
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
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  static async delete(req, res) {
    try {
      const hospital = await Hospital.findByIdAndDelete(req.params.id)
      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: 'Hôpital non trouvé',
        })
      }
      res.status(200).json({
        success: true,
        message: 'Hôpital supprimé avec succès',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
}

module.exports = HospitalController
