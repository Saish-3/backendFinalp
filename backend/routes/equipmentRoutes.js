const express = require('express');
const router = express.Router();
const {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
} = require('../controllers/equipmentController');
const { protect, authorize } = require('../middleware/auth');
const {
  createEquipmentValidator,
  updateEquipmentValidator,
  getEquipmentValidator
} = require('../validators/equipmentValidator');
const validate = require('../middleware/validate');

// Public routes
router.get('/', getEquipment);
router.get('/:id', getEquipmentValidator, validate, getEquipmentById);

// Admin-only routes
router.post(
  '/',
  protect,
  authorize('admin'),
  createEquipmentValidator,
  validate,
  createEquipment
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateEquipmentValidator,
  validate,
  updateEquipment
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  getEquipmentValidator,
  validate,
  deleteEquipment
);

module.exports = router;
