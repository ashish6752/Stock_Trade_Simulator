const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true },
  companyName: { type: String, default: "" },
  buyPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  currentPrice: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Stock", stockSchema);
