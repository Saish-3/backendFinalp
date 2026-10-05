const Rental = require('../models/Rental');
const Equipment = require('../models/Equipment');

// @desc    Create a new rental
// @route   POST /api/rentals
// @access  Private (Member or Admin)
const createRental = async (req, res, next) => {
  const { equipmentId, days } = req.body;
  let equipmentUpdated = false;

  try {
    // Business Rule 1: Atomic availability check and lock
    const equipment = await Equipment.findOneAndUpdate(
      { _id: equipmentId, available: true },
      { available: false },
      { new: true }
    );

    if (!equipment) {
      return res.status(409).json({
        success: false,
        message: 'Equipment is not available for rent'
      });
    }

    equipmentUpdated = true;

    // Business Rule 2: Rental duration and dueDate calculation (now + days)
    const rentedAt = new Date();
    const dueDate = new Date(rentedAt.getTime() + days * 24 * 60 * 60 * 1000);

    const rental = await Rental.create({
      equipment: equipmentId,
      member: req.user._id,
      rentedAt,
      dueDate,
      status: 'active'
    });

    const populatedRental = await Rental.findById(rental._id)
      .populate('equipment', 'name category description available')
      .populate('member', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Equipment rented successfully',
      data: populatedRental
    });
  } catch (error) {
    // Rollback equipment availability if rental creation fails
    if (equipmentUpdated) {
      await Equipment.findByIdAndUpdate(equipmentId, { available: true });
    }
    next(error);
  }
};

// @desc    Mark a rental as returned
// @route   POST /api/rentals/:id/return
// @access  Private (Admin only)
const returnRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: `Rental not found with ID of ${req.params.id}`
      });
    }

    // Business Rule 3: Rental must be active
    if (rental.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Rental has already been marked as returned'
      });
    }

    rental.status = 'returned';
    rental.returnedAt = new Date();
    await rental.save();

    // Release equipment availability
    await Equipment.findByIdAndUpdate(rental.equipment, { available: true });

    const updatedRental = await Rental.findById(rental._id)
      .populate('equipment', 'name category description available')
      .populate('member', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Equipment marked as returned successfully',
      data: updatedRental
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rentals (member: own rentals; admin: all rentals / overdue filter)
// @route   GET /api/rentals
// @access  Private
const getRentals = async (req, res, next) => {
  try {
    const { overdue, status } = req.query;
    const filter = {};

    // Role-based access control
    if (req.user.role === 'member') {
      // Members only see their own rentals
      filter.member = req.user._id;

      if (overdue === 'true') {
        // If member filters by overdue
        filter.status = 'active';
        filter.dueDate = { $lt: new Date() };
      } else if (status) {
        filter.status = status;
      }
    } else if (req.user.role === 'admin') {
      // Admin can see all rentals or filter by overdue/status
      if (overdue === 'true') {
        filter.status = 'active';
        filter.dueDate = { $lt: new Date() };
      } else if (status) {
        filter.status = status;
      }
    }

    const rentals = await Rental.find(filter)
      .populate('equipment', 'name category description available')
      .populate('member', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single rental by ID
// @route   GET /api/rentals/:id
// @access  Private (Owner or Admin)
const getRentalById = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('equipment', 'name category description available')
      .populate('member', 'name email role');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: `Rental not found with ID of ${req.params.id}`
      });
    }

    // Check authorization (must be admin or the owner member)
    if (
      req.user.role !== 'admin' &&
      rental.member._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view this rental record'
      });
    }

    res.status(200).json({
      success: true,
      data: rental
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRental,
  returnRental,
  getRentals,
  getRentalById
};
