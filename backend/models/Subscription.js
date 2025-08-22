// models/Subscription.js
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
  },
  keys: {
    p256dh: String,
    auth: String,
  },
}, { timestamps: true });

export default mongoose.model("Subscription", subscriptionSchema);