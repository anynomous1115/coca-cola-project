const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Post = require("../models/Posts.model");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const jsonPath = path.resolve(__dirname, "posts.json");

async function importData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const rawData = fs.readFileSync(jsonPath);
    const posts = JSON.parse(rawData);

    await Post.insertMany(posts);
    console.log(`Imported ${posts.length} posts.`);
    process.exit(0);
  } catch (err) {
    console.error("Import failed:", err);
    process.exit(1);
  }
}

importData();
