const { body, param, query } = require('express-validator');

const createEquipmentValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Equipment name is required')
    .isLength({ max: 100 })
    .withMessage('Equipment name cannot exceed 100 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

const updateEquipmentValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid equipment ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Equipment name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Equipment name cannot exceed 100 characters'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be a boolean (true/false)')
];

const getEquipmentValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid equipment ID format')
];

module.exports = {
  createEquipmentValidator,
  updateEquipmentValidator,
  getEquipmentValidator
};
