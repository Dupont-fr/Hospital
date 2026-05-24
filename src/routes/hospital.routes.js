const express = require('express')
const router = express.Router()
const HospitalController = require('../controllers/hospital.controller')
const authenticate = require('../middlewares/auth.middleware')

router.get('/hospitals', authenticate, HospitalController.getAll)
router.get('/hospitals/:id', authenticate, HospitalController.getById)
router.post('/hospitals', authenticate, HospitalController.create)

module.exports = router
