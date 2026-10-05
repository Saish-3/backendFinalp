const express = require('express');
const router = express.Router();
const {
  createRental,
  returnRental,
  getRentals,
  getRentalById
} = require('../controllers/rentalController');
const { protect, authorize } = require('../middleware/auth');
const {
  createRentalValidator,
  rentalIdValidator
} = require('../validators/rentalValidator');
const validate = require('../middleware/validate');

// All rental routes require authentication
router.use(protect);

// GET /api/rentals & POST /api/rentals
router
  .route('/')
  .get(getRentals)
  .post(createRentalValidator, validate, createRental);

// POST /api/rentals/:id/return (Admin only)
router.post(
  '/:id/return',
  authorize('admin'),
  rentalIdValidator,
  validate,
  returnRental
);

// GET /api/rentals/:id (Owner or Admin)
router.get('/:id', rentalIdValidator, validate, getRentalById);

module.exports = router;
