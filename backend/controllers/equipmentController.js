const Equipment = require('../models/Equipment');
const Rental = require('../models/Rental');

// @desc    Get all equipment (with category, available & search filters)
// @route   GET /api/equipment
// @access  Public
const getEquipment = async (req, res, next) => {
  try {
    const { category, available, search } = req.query;
    const query = {};

    if (category) {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    if (available !== undefined && available !== '') {
      query.available = available === 'true';
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const equipment = await Equipment.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: equipment.length,
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single equipment by ID
// @route   GET /api/equipment/:id
// @access  Public
const getEquipmentById = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: `Equipment not found with ID of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new equipment
// @route   POST /api/equipment
// @access  Private (Admin only)
const createEquipment = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;

    const equipment = await Equipment.create({
      name,
      category,
      description: description || '',
      available: true
    });

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private (Admin only)
const updateEquipment = async (req, res, next) => {
  try {
    const { name, category, description, available } = req.body;

    let equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: `Equipment not found with ID of ${req.params.id}`
      });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (available !== undefined) updates.available = available;

    equipment = await Equipment.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Equipment updated successfully',
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete equipment (block if active rental exists)
// @route   DELETE /api/equipment/:id
// @access  Private (Admin only)
const deleteEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: `Equipment not found with ID of ${req.params.id}`
      });
    }

    // Business Rule: Block delete if the item has an active rental
    const activeRental = await Rental.findOne({
      equipment: req.params.id,
      status: 'active'
    });

    if (activeRental) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete equipment while it has an active rental'
      });
    }

    await Equipment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};
