const express = require('express')
const router = express.Router()
const HospitalController = require('../controllers/hospital.controller')
const authenticate = require('../middlewares/auth.middleware')
const { requireAdmin } = require('../middlewares/role.middleware')

router.get('/hospitals', authenticate, HospitalController.getAll)
router.get('/hospitals/:id', authenticate, HospitalController.getById)
router.post('/hospitals', authenticate, requireAdmin, HospitalController.create)
router.put('/hospitals/:id', authenticate, requireAdmin, HospitalController.update)
router.delete('/hospitals/:id', authenticate, requireAdmin, HospitalController.delete)

module.exports = router
