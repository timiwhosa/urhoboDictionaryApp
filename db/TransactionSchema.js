var mongoose = require("mongoose");

var TransactionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
  },
  public: {
    type: Boolean,
    required: true,
  },
  pledgeAmount: {
    type: Number,
    required: true,
  },
  nairaAmount: {
    type: Number,
    required: true,
  },
  exchangeRate: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "paid"],
  },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
