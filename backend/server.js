const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Main API route
app.use("/api", require("./routes/index.router"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Inventory API: http://localhost:${PORT}/api/inventory`);
  console.log(`🛒 Orders API: http://localhost:${PORT}/api/orders`);
  console.log(`🎁 Promotions API: http://localhost:${PORT}/api/promotions`);
  console.log(`🚚 Shipping API: http://localhost:${PORT}/api/shipping`);
  console.log(`📱 Zalo API: http://localhost:${PORT}/api/zalo`);
});
