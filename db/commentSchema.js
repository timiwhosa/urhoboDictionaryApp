const mongoose = require("mongoose");

var replySchema = new mongoose.Schema({
  img: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: "reply",
    },
    date: {
        type: Date,
        required: true
  }
});
var commentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["message", "reply"],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  reply: [replySchema],
});

module.exports = mongoose.model("Comment", commentSchema);
