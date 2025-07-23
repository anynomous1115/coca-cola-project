const {
  getAllPostsService,
  getPostByIdService,
} = require("../services/posts.service");
const { paginateUtil } = require("../utils/pagination");
const { successHandler, errorHandler } = require("../helpers/responseHandler");

exports.getAllPosts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 100);

    const totalPosts = await getAllPostsService("count");
    const posts = await getAllPostsService("paginate", { page, limit });

    const pagination = paginateUtil(page, limit, totalPosts);
    console.log({
      posts,
      pagination,
    });

    successHandler(
      res,
      {
        posts,
        pagination,
      },
      "Posts retrieved successfully",
      200
    );
  } catch (err) {
    errorHandler(res, {
      code: 500,
      message: "Failed to retrieve posts",
      details: err.message,
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await getPostByIdService(req.params.id);
    if (!post) {
      return errorHandler(res, {
        code: 404,
        message: "Post not found",
      });
    }
    successHandler(res, post, "Post retrieved successfully", 200);
  } catch (err) {
    errorHandler(res, {
      code: 500,
      message: "Failed to retrieve post",
      details: err.message,
    });
  }
};
