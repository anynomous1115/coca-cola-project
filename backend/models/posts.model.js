const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  images: [{ type: String, required: true }],
  articleUrl: { type: String, required: true },
  createdAt: { type: Date, required: true },
  crawledAt: { type: Date, default: Date.now },
});

postSchema.index({ crawledAt: 1 });

module.exports = mongoose.model("Post", postSchema);
