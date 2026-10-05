const { body, param } = require('express-validator');

const createRentalValidator = [
  body('equipmentId')
    .notEmpty()
    .withMessage('Equipment ID is required')
    .isMongoId()
    .withMessage('Invalid equipment ID format'),
  body('days')
    .notEmpty()
    .withMessage('Rental duration (days) is required')
    .isInt({ min: 1, max: 14 })
    .withMessage('Rental duration must be an integer between 1 and 14 days')
    .toInt()
];

const rentalIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid rental ID format')
];

module.exports = {
  createRentalValidator,
  rentalIdValidator
};
