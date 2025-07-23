const { paginateUtil } = require("../utils/pagination");
const { successHandler, errorHandler } = require("../helpers/responseHandler");
const { getProductByIdService } = require("../services/products.service");

exports.getAllProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 100);

    const totalProducts = await getAllProductsService("count");
    const products = await getAllProductsService("paginate", { page, limit });

    const pagination = paginateUtil(page, limit, totalProducts);
    console.log({
      products,
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

exports.getProductById = async (req, res) => {
  try {
    const product = await getProductByIdService(req.params.id);
    if (!product) {
      return errorHandler(res, {
        code: 404,
        message: "Product not found",
      });
    }
    successHandler(res, product, "Product retrieved successfully", 200);
  } catch (err) {
    errorHandler(res, {
      code: 500,
      message: "Failed to retrieve product",
      details: err.message,
    });
  }
};
