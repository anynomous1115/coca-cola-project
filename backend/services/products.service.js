const Product = require("../models/products.model");

class ProductService {
  // Kiểm tra tồn kho
  async checkStock(productId, quantity = 1) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      if (!product.isActive) {
        return {
          success: false,
          message: "Product is not available",
        };
      }

      const isAvailable = product.stock >= quantity;

      return {
        success: true,
        data: {
          productId,
          productName: product.name,
          currentStock: product.stock,
          requestedQuantity: quantity,
          isAvailable,
          canFulfill: isAvailable ? quantity : product.stock,
        },
      };
    } catch (error) {
      console.error("Error checking stock:", error);
      return {
        success: false,
        message: "Error checking stock",
      };
    }
  }

  // Kiểm tra tồn kho nhiều sản phẩm
  async checkMultipleStock(items) {
    try {
      const results = [];
      let allAvailable = true;

      for (const item of items) {
        const stockCheck = await this.checkStock(item.productId, item.quantity);
        results.push(stockCheck);

        if (!stockCheck.success || !stockCheck.data.isAvailable) {
          allAvailable = false;
        }
      }

      return {
        success: true,
        data: {
          items: results,
          allItemsAvailable: allAvailable,
        },
      };
    } catch (error) {
      console.error("Error checking multiple stock:", error);
      return {
        success: false,
        message: "Error checking stock",
      };
    }
  }

  // Lấy danh sách sản phẩm
  async getProducts(options = {}) {
    try {
      const { category, page = 1, limit = 10, search } = options;
      const skip = (page - 1) * limit;

      let query = { isActive: true };

      if (category) {
        query.category = category;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const products = await Product.find(query)
        .populate("category", "name")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Product.countDocuments(query);

      return {
        success: true,
        data: {
          products,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error("Error getting products:", error);
      return {
        success: false,
        message: "Error getting products",
      };
    }
  }

  // Cập nhật tồn kho (giảm khi đặt hàng)
  async updateStock(productId, quantity, operation = "decrease") {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      let newStock;
      if (operation === "decrease") {
        newStock = product.stock - quantity;
        if (newStock < 0) {
          return {
            success: false,
            message: "Insufficient stock",
          };
        }
      } else {
        newStock = product.stock + quantity;
      }

      await Product.findByIdAndUpdate(productId, { stock: newStock });

      return {
        success: true,
        data: {
          productId,
          previousStock: product.stock,
          newStock,
          operation,
        },
      };
    } catch (error) {
      console.error("Error updating stock:", error);
      return {
        success: false,
        message: "Error updating stock",
      };
    }
  }
}

module.exports = new ProductService();

exports.getProductByIdService = async (id) => {
  try {
    const product = await productsModel.findById(id);
    if (!product) {
      const error = new Error("Product not found");
      error.status = 404;
      throw error;
    }
    return product;
  } catch (err) {
    if (err.status === 404) throw err;
    throw new Error("Failed to retrieve product: " + err.message);
  }
};
