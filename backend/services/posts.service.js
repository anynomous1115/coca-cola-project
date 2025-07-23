const Post = require("../models/posts.model");

exports.getAllPostsService = async (type = "paginate", options = {}) => {
  try {
    if (type === "count") {
      return await Post.countDocuments();
    }
    const { page = 1, limit = 5 } = options;
    const skip = (page - 1) * limit;
    return await Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
  } catch (err) {
    throw new Error("Failed to retrieve posts: " + err.message);
  }
};

exports.getPostByIdService = async (id) => {
  try {
    const post = await Post.findById(id);
    if (!post) {
      const error = new Error("Post not found");
      error.status = 404;
      throw error;
    }
    return post;
  } catch (err) {
    if (err.status === 404) throw err;
    throw new Error("Failed to retrieve post: " + err.message);
  }
};
