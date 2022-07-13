const express = require("express");
const app = express();
const server = require("http").createServer(app);
const path = require("path");
const mongoose = require("mongoose");
const satelize = require("satelize");
const { RateLimiterMemory } = require("rate-limiter-flexible");

var salt = 10; //process.env


/* UTILS*/

const { mongodbConnect, models } = require("./utils/mongoose-connection");

try{
  mongodbConnect(mongoose);
}catch(err){
  console.error(err)
}

const io = require("socket.io")(server);
const Port = process.env.PORT || 4003;
String.prototype.escape = function () {
  var tagtoreplace = {
    "&": "&amp;",
    "<": "&lt",
    ">": "&gt",
    script: " ",
    Script: " ",
    '"': " ",
    "`": " ",
  };
  return this.replace(/[&<>`]/g, function (tag) {
    return tagtoreplace[tag] || tag;
  });
};
require("./utils/io-code")(io, models(),escape);

/* the rest*/
const Public = path.join(__dirname, "/public");
const userRoute = require("./routes/userRoute");
userRoute.io = io;
const adminRoute = require("./routes/adminRoute");
adminRoute.io = io;

// app.use(require("helmet")())
app.use(express.static(Public));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use()
app.use("/user", userRoute);
app.use("/admin", adminRoute);

app.get("/", (req, res) => {
  res.sendFile(Public + "/index.html");
});
app.get("/sponsor", (req, res) => {
  res.sendFile(Public + "/support.html");
});
app.get("/congrats", (req, res) => {
  res.sendFile(Public + "/congrats.html");
});
app.get("/myip",(req,res)=>{
  let ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
  satelize
    .satelize({ ip: ip },(err,data) => {
      if(err){
        console.error(err)
        return res.send(err)
      }
      res.send(
        `<h1>satelize: ${JSON.stringify(data,null,2)} </br> req.ip: ${
          req.ip + " " + res.socket.localAddress
        } </br> req.connection.remoteAddress: ${
          req.connection.remoteAddress
        }</h1>`,
      );
    })
})

// 404
app.use((req,res,next)=>{
  res.redirect("/")
})
// error handling
app.use((err,req,res,next)=>{
  if(err){
    res.end()
    return console.error(err)
  }
  next();
})
server.listen(Port);