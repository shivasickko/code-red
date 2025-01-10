// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  // location: {
  //   country: { type: String, required: true },
  //   region: { type: String },
  //   city: { type: String },
  // },
  points: {
    type: Number,
    default: 0,
  },
});

const User = mongoose.model('User', UserSchema);
export default User;