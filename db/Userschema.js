var mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
var userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  hash: {
    type: String,
    required: true,
  },
    salt: {
        type: String,
        required: true
    }
});

userSchema.plugin(passportLocalMongoose);
module.exports =  mongoose.model("User", userSchema);
