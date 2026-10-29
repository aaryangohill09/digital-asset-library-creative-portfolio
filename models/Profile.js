
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.Profile ||
  mongoose.model("Profile", profileSchema);

  