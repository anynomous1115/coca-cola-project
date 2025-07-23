const express = require("express");
const { getAllProducts, getProductById } = require("../controllers/products.controller");
const router = express.Router();

router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);

module.exports = router;