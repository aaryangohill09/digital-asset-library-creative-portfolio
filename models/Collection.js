
const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
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
      maxlength: 100
    },
    assets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Asset"
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.Collection ||
  mongoose.model("Collection", collectionSchema);

  