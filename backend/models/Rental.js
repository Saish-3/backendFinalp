const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment reference is required']
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Member reference is required']
    },
    rentedAt: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    returnedAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'returned'],
        message: '{VALUE} is not a valid rental status'
      },
      default: 'active'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound and individual indexes for query optimization
rentalSchema.index({ status: 1 });
rentalSchema.index({ dueDate: 1 });
rentalSchema.index({ member: 1, status: 1 });
rentalSchema.index({ equipment: 1, status: 1 });

// Virtual for dynamic isOverdue computation (no cron job needed)
rentalSchema.virtual('isOverdue').get(function () {
  if (this.status === 'active' && this.dueDate) {
    return new Date() > new Date(this.dueDate);
  }
  return false;
});

module.exports = mongoose.model('Rental', rentalSchema);
