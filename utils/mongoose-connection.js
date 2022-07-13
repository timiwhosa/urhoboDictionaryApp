require('dotenv').config();
var mongooseUrl = process.env.Mongoose_Url;
const mongodbConnect = (mongoose) => {
    mongoose.connect(`${mongooseUrl}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", () => {
        console.log("connected successfully");
    });
};

const models = () => {
    // mongodb scheme
    const User = require("../db/Userschema.js");
    const Comment = require("../db/commentSchema.js");
    const {
      Supporters,
      singlesupporter,
    } = require("../db/supportersSchema.js");
    const Transaction = require("../db/TransactionSchema.js");

    return { User, Comment, Supporters, singlesupporter, Transaction };
}

module.exports = {
    mongodbConnect,
    models
}