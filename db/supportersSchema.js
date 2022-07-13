const mongoose = require("mongoose");

var singlesupporterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
  },
  img: {
    type: String,
    required: true,
  },
  contributionId: {
    type: String,
    required: true,
    unique: true
  },
  public:{
    type: Boolean,
    required:true
  },
  amount: {
    type: Number,
    required: true,
  },
  reward: {
    type: String,
    required: true,
    enum: ["silver", "gold", "iridium", "ruthenium", "platinum", "rhodium"],
  },
});

var supportersSchema = new mongoose.Schema({
  total: {
    type: Number,
    require: true,
  },
  supporters: [singlesupporterSchema],
});
var Supporters = new mongoose.model("Supporters", supportersSchema);
var singlesupporter = new mongoose.model(
  "singlesupporter",
  singlesupporterSchema,
);
module.exports = { Supporters, singlesupporter };
