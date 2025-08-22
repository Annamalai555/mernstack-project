import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: Number, default: 0 } // 0 = user, 1 = admin
});

export default mongoose.model("User", userSchema);
