const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const router = express.Router();
const session = require("express-session");
const passport = require("passport");

// const jwt = require("jsonwebtoken");
require("dotenv").config();
// mongodb scheme
const User = require("../db/Userschema.js");

const SessionConfig = session({
    secret: process.env.Session_secret,
    resave: false,
    saveUninitialized: false,
  });
const wrap = (expressMiddleware) => (socket, next) =>
  expressMiddleware(socket.request, {}, next);

router.use(SessionConfig);
// Initializing Passport
router.use(passport.initialize());

// Starting the session
router.use(passport.session());
passport.use(User.createStrategy());
// Serializing and deserializing
passport.serializeUser(User.serializeUser((user,done)=>done(null,user.id)));
passport.deserializeUser(User.deserializeUser((id,done)=> {
    return done(null,User.find({_id: id}))
}));
function auth(req, res, next) {
     if (!req.isAuthenticated())return res.redirect("/admin/login");
     next();
}
// User.register(
//   { username: "admin", password: "123456789" },
//   "123456789",
//   function (err, user) {
//     if (err) {
//       // if some error is occurring, log that error
//       console.log(err);
//     } else {
//       passport.authenticate("local")(req, res, function () {
//         console.log("done");
//       });
//     }
//   },
// );

router.route("/home").get(auth, (req, res) => {
    router.io.use(wrap(SessionConfig));
    router.io.use(wrap(passport.initialize()));
    router.io.use(wrap(passport.session()));
    res.sendFile(path.join(__dirname, "../privateAdminPage/dashboard.html"));
});
router.get("/resource", auth, (req, res) => {
    if (req.query) {
        var file = req.query.file;
        res.sendFile(path.join(__dirname, `../privateAdminPage/${file}`));
    } else {
        res.status(404).end();
    }
});

router
    .route("/login")
    .get((req, res) => {
        res.sendFile(path.join(__dirname, "../privateAdminPage/login.html"));
    })
    .post((req, res) => {
        try {
             req.body && req.body.username && req.body.password ?
            (() => {
                var username = req.body.username;
                var password = req.body.password;
                const userToBeChecked = new User({
                  username, password
                });
                req.login(userToBeChecked,(err)=>{
                    if(err) return res.status(501).json({ error: "error" });
                    passport.authenticate("local")(req, res, function () {
                      User.find(
                        { username: req.user.username },
                        function (err, docs) {
                          if (err) {
                            return res.status(501).json({ error: "error" });
                          } else {
                            //login is successful
                            res.status(200).json({ redirect: "/admin/home" });
                          }
                        },
                      );
                    });
                })
                
            })() :
            (() => {
                res.status(501).json({ error: "error" });
            })();
        } catch (error) {
            console.error(error)
        }
       
        // authentication and authorization comes HERE
        // res.status(200).json({ redirect: "/admin/home" });
    });
// router.route("/login.js").get((req,res)=>{
//     res.sendFile(path.join(__dirname, "/privateAdminPage/login.js"));
// })
router.route("/logout").post(auth,(req,res)=>{
    req.logout(function (err) {
      if (err) {
        return console.log(err)
      }
      res.status(200).json({ url: "/admin/login" });
    });
    
})

router.route("/newupdate").post(auth,(req, res) => {
    if (!req.body || !req.query.type) {
        return res.status(501).json({ message: "respect your self o" });
    }
    if (req.query.type != "username" && req.query.type != "password") {
        return res.status(501).json({ message: "nawa o" });
    }
    if (req.query.type === "username") {
        let { username, password, newusername } = req.body;
        if (
            username &&
            password &&
            newusername &&
            username.trim().length > 4 &&
            newusername.trim().length > 4 &&
            password.length > 3
        ) {
            passport.authenticate("local")(req,res,()=>{
                User.findOne({ username: req.user.username},(err,doc)=>{
                    if(err) return res.json({ message: "error occured" });
                    doc.username = newusername;
                    doc.save().then(() => {
                      res.status(200).json({ message: "updated username" });
                    });
                })
            });
            
        }
    } else if (req.query.type === "password") {
        let { username, password, newpassword } = req.body;
        if (
            username &&
            password &&
            newpassword &&
            username.trim().length > 4 &&
            newpassword.length > 4 &&
            password.length > 3
        ) {
             passport.authenticate("local")(req, res, () => {
               User.findOne({ username: req.user.username }, (err, doc) => {
                 if (err) return res.json({ message: "error occured" });
                 doc.changePassword(password, newpassword).then((resp)=>{
                    res.status(200).json({ message: "updated password" });
                 }).catch(err=>{res.status(501).json({ message: "errror occured" });});
               });
             });
        }
    }
});

module.exports = router;