import mongoose from 'mongoose';

const rejectionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: () => new Date().setHours(0, 0, 0, 0), // Start of the current day
  },
  rejectionPoint: {
    type: String,
    required: true,
  },
  numbers: {
    type: Number,
    required: true,
    default: 1,
  },
  lastUpdatedDate: {
    type: Date,
    default: Date.now, // Current date when created
  },
});

// Pre-hook to update lastUpdatedDate before updating a document
rejectionSchema.pre('findOneAndUpdate', function (next) {
  this.set({ lastUpdatedDate: Date.now() });
  next();
});

rejectionSchema.index({ date: 1, rejectionPoint: 1 }, { unique: true });

const Rejection = mongoose.model('Rejection', rejectionSchema);

export default Rejection;
