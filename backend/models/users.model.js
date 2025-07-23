const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    zaloId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: String,
    address: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
