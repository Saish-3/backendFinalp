const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide equipment name'],
      trim: true,
      maxlength: [100, 'Equipment name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Please provide equipment category'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters']
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    available: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for search & filter optimization
equipmentSchema.index({ category: 1, available: 1 });
equipmentSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Equipment', equipmentSchema);
