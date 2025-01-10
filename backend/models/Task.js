// models/Task.js
import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  initialImage: {
    type: String, //storing image filename or URL
    required: true,
  },
  initialImageAnalysisData: {
    type: Object,
    required: true,
  },
  location: {
    type: {
      type: String, // 'Point'
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      // required: true,
    },
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired', 'completed'],
    default: 'pending',
  },
  disposedImage: {
    type: String,
    default: null,
  },
  disposedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Optional: auto-delete after 24 hours
  },
  acceptedAt: {
    type: Date,
    default: null,
  },
});

TaskSchema.index({ location: '2dsphere' });

const Task = mongoose.model('Task', TaskSchema);
export default Task;