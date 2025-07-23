const { default: mongoose } = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    quantity: Number,
    price: Number,
    total: Number,
  }],
  totalAmount: Number,
  shippingFee: Number, 
  customerInfo: {
    name: String,
    phone: String,
    address: String,
    districtId: Number, 
    wardCode: String,  
  },
  discountCode: String,
  discountAmount: Number,
  leadtime: Date, 
  ghnOrderCode: String, 
  status: {
    type: String,
    enum: [
      "ready_to_pick",
      "picking",
      "picked",
      "storing",
      "transporting",
      "sorting",
      "delivering",
      "delivered",
      "return",
      "returned",
      "cancel",
      "lost",
      "damage",
    ],
    default: "ready_to_pick",
  },
});
module.exports = mongoose.model("Order", orderSchema);