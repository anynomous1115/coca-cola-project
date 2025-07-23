const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Load environment variables
dotenv.config();

// Import models
const Category = require("../models/categories.model");
const Product = require("../models/products.model");
const User = require("../models/users.model");
const Order = require("../models/orders.model");
const Discount = require("../models/discounts.model");

// Database connection
const connectDB = require("../config/db");

// Import data function
async function importData() {
  try {
    // Connect to database
    await connectDB();
    console.log("📦 Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    await Discount.deleteMany({});

    // Read sample data
    const sampleDataPath = path.join(__dirname, "sampleData.json");
    const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, "utf8"));

    // Import categories
    console.log("📁 Importing categories...");
    const categoriesData = sampleData.categories.map((category) => {
      const { _id, ...categoryWithoutId } = category;
      return categoryWithoutId;
    });
    const categories = await Category.insertMany(categoriesData);
    console.log(`✅ Imported ${categories.length} categories`);

    // Import products
    console.log("🥤 Importing products...");
    const productsData = sampleData.products.map((product) => {
      const { _id, ...productWithoutId } = product;
      return productWithoutId;
    });
    const products = await Product.insertMany(productsData);
    console.log(`✅ Imported ${products.length} products`);

    // Import users
    console.log("👥 Importing users...");
    const usersData = sampleData.users.map((user) => {
      const { _id, ...userWithoutId } = user;
      return userWithoutId;
    });
    const users = await User.insertMany(usersData);
    console.log(`✅ Imported ${users.length} users`);

    // Import discounts
    console.log("🎁 Importing discounts...");
    const discountsData = sampleData.discounts.map((discount) => {
      const { _id, ...discountWithoutId } = discount;
      return discountWithoutId;
    });
    const discounts = await Discount.insertMany(discountsData);
    console.log(`✅ Imported ${discounts.length} discounts`);

    // Import orders
    console.log("📋 Importing orders...");
    const ordersData = sampleData.orders.map((order) => {
      const { _id, ...orderWithoutId } = order;
      return orderWithoutId;
    });
    const orders = await Order.insertMany(ordersData);
    console.log(`✅ Imported ${orders.length} orders`);

    console.log("🎉 All data imported successfully!");
  } catch (error) {
    console.error("❌ Error importing data:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Clear data function
async function clearData() {
  try {
    await connectDB();
    console.log("📦 Connected to MongoDB");

    console.log("🗑️  Clearing all data...");
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    await Discount.deleteMany({});

    console.log("✅ All data cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === "import") {
  console.log("🚀 Starting data import...");
  importData();
} else if (command === "clear") {
  console.log("🧹 Starting data clear...");
  clearData();
} else {
  console.log("Usage:");
  console.log("  npm run import-data  - Import sample data");
  console.log("  npm run clear-data   - Clear all data");
}
