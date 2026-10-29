
const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      default: ""
    },
    resourceType: {
      type: String,
      enum: ["image", "video", "raw"],
      default: "image"
    },
    type: {
      type: String,
      default: "file"
    },
    format: {
      type: String,
      default: ""
    },
    size: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.Asset ||
  mongoose.model("Asset", assetSchema);

  