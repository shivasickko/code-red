import mongoose from "mongoose";

const rewardTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  points: {
    type: Number,
    required: true,
  },
  benefits: {
    type: [String],
    required: true,
  },
});

const RewardTier = mongoose.model('RewardTier', rewardTierSchema);
export default RewardTier;
