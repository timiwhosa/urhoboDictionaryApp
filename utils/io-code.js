const { isValidObjectId } = require("mongoose");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const hostUrl  = process.env.hostUrl;
const paymentRedirectUrl =
  process.env.paymentRedirectUrl || "http://urhobodictionary.herokuapp.com/user/verifypay";

const validator = require("validator");
const SocketrateLimiter = new RateLimiterMemory({
    points: 5000,
    duration: 5 * 60,
});
const AdminSocketrateLimiter = new RateLimiterMemory({
    points: 200,
    duration: 60,
});
module.exports = async (io, models,escape) => {
    const { Comment, Supporters, singlesupporter, Transaction } = models;
    var NumberOfComments = 0;
    var NumberOfSupporters = 0;
    var totalraised = 0;
    
    function sanitizedName(name) {
        var newName = name.toLowerCase();
        if (newName.includes("urhobo") && newName.includes("dictionary")) {
            return false;
        } else {
            return true;
        }
    }
    
    function AddAdminToroom(socket){
        // if admin, add to a private room
        socket && socket.request && socket.request.session
            ? (() => {
            if (socket.request.isAuthenticated()) {
                socket.join("privateRoom");
            }
            })()
            : "hi";
    }
    function validateUser(socket, cb) {
      // if admin, add to a private room
      socket && socket.request && socket.request.session
        ? (() => {
            if (socket.request.isAuthenticated()) {
              cb();
            }
          })()
        : socket.emit("error","unauthorised");
    }
    io.on("connection", async(socket) => {
         AddAdminToroom(socket);
         const { initializePayment, verifyPayment } = require("./payment")(io);
      /*GENERAL EVENTS */
      socket.on("noof", async () => {
        try {
          await SocketrateLimiter.consume(socket.id);
            var commentsNumber = await Comment.count({});
            var supportersNumber = 0;
            (
              await Supporters.find().then((data) => {
                if (data.length > 0) {
                  totalraised = data[0].total
                  supportersNumber= data[0].supporters.length;
                } else {
                  totalraised =0;
                  supportersNumber = 0;
                }
              }).catch(console.error)
            );
            NumberOfComments = commentsNumber;
            NumberOfSupporters = supportersNumber;
            socket.emit("numbers", {
              comments: commentsNumber,
              supporters: supportersNumber,
              totalraised,
            });
        } catch (error) {
          console.log(error)
        }
      });

      socket.on("getall50Messages", async (number) => {
        // query db based on required
        try {
          await SocketrateLimiter.consume(socket.id);
          if (number.number === 1) {
            Comment.find({})
              .limit("50")
              .then((data) => {
                data && data.length > 0
                  ? (() => {
                      var newData = data.map((comment) => {
                        let { name, message, img, type, _id, reply } = comment;
                        return {
                          name,
                          message,
                          img,
                          type,
                          id: _id,
                          reply,
                        };
                      });
                      socket.emit("50Messages", newData.reverse());
                    })()
                  : console.log(data);
              })
              .catch(console.log);
          }
        } catch (error) {
          console.error(error);
        }
      });

      /*ADMIN EVENTS */

      socket.on("reply", async (message) => {
        try {
          await AdminSocketrateLimiter.consume(socket.id);
          function replyFunction(){
            const reply = ({ message, type, postId } = message);
          reply.name = "urhoboDictionary";
          reply.img = "/img/urhoboDictionary-logo-blue1.png";
          reply.date = Date.now();
          // save reply to DB
          Comment.find({ _id: reply.postId })
            .then((data) => {
              if (data && data.length === 1) {
                data[0].reply.push(reply);
                data[0]
                  .save()
                  .then((res) => {
                    let {
                      img,
                      message,
                      name,
                      id: _id,
                      type,
                    } = res.reply[res.reply.length - 1];
                    let newreply = {
                      img,
                      message,
                      name,
                      ReplyId: _id,
                      type,
                      postId,
                    };
                    io.emit("reply", newreply);
                  })
                  .catch(console.error);
              }
            })
            .catch(console.error);
          }
          validateUser(socket, replyFunction);
          
        } catch (error) {
          console.log(error);
        }
      });
      socket.on("delete-reply-62b08bd936b423b5acbfa222", async (details) => {
        try {
          await AdminSocketrateLimiter.consume(socket.id);
          function DeleteReply() {
            let { postId, ReplyId } = details;
            Comment.find({ _id: postId })
              .then((post) => {
                if (post && post.length === 1) {
                  post[0].reply.filter((reply, index) => {
                    if (reply.ReplyId === ReplyId) {
                      post[0].reply.splice(index, 1);
                    }
                  });
                  post[0].save().then(() => {
                    io.emit("delete-reply", { postId, ReplyId });
                  });
                } else {
                  console.log("not found");
                }
              })
              .catch(console.error);
          }

          validateUser(socket, DeleteReply);
        } catch (error) {
          console.log(error);
        }
      });

      socket.on("getallMessages", async (number) => {
        // query db for all comments
        try {
          await SocketrateLimiter.consume(socket.id);
          function GetAllmessages(){
            if (number.number === 1) {
            Comment.find({})
              .then((data) => {
                data && data.length > 0
                  ? (() => {
                      var newData = data.map((comment) => {
                        let { name, message, img, type, _id, reply } = comment;
                        return {
                          name,
                          message,
                          img,
                          type,
                          id: _id,
                          reply,
                        };
                      });
                      socket.emit("AllMessages", newData.reverse());
                    })()
                  : console.log(data);
              })
              .catch(console.log);
          }
          }
          validateUser(socket, GetAllmessages);
          
        } catch (error) {
          console.log(error);
        }
      });
      socket.on("GetAdmingetSupporters3b5acbfa222", async () => {
        try {
          await AdminSocketrateLimiter.consume(socket.id);
          function adminSupporter(){
            Supporters.find({}).then((supporters)=>{
              if(supporters && supporters.length>0){
                io.to("privateRoom").emit("AdminSupporters", supporters);
              }else{
                io.to("privateRoom").emit("error",{message: "no supporter yet"})
              }
            })
            }
        validateUser(socket, adminSupporter);
        } catch (error) {
            console.error(error);
        }
      });
      

      /*USER EVENTS */
      // New comment is made by users not admin
      socket.on("newComment", async (comment) => {
        try {
          await SocketrateLimiter.consume(socket.id);
          comment &&
          comment.message &&
          comment.email &&
          comment.message.trim().length > 5 &&
          comment.message.trim().length < 201 &&
          comment.email.trim().length > 6 &&
          comment.email.trim().length < 25
            ? (() => {
                let { name, message, email } = comment;
                if (sanitizedName(name)) {
                  // save comment here
                  /* get an image icon for the user*/
                  var namesplit = name.trim().split(/[,.\s]/);
                  let newComment = new Comment({
                    name,
                    email,
                    message,
                    img:
                      namesplit.length > 1
                        ? `https://ui-avatars.com/api/?size=128&name=${namesplit[0]}+${namesplit[1]}&rounded=true&uppercase=true&size=128&bold=true&background=random`
                        : `https://ui-avatars.com/api/?size=128&name=${namesplit[0]}&rounded=true&uppercase=true&size=128&bold=true&background=random`,
                    type: "message",
                    reply: [],
                    date: Date.now(),
                  });
                  newComment.save().then((data) => {
                    NumberOfComments++;
                    let { _id } = data;
                    io.emit("newMessage", [
                      {
                        name,
                        message,
                        img: data.img,
                        id: _id,
                        reply: [],
                      },
                    ]);
                  });
                }
              })()
            : (() => {
                throw "wrong message";
              })();
        } catch (error) {
          //emit new error to sender only
          console.error(error);
        }
      });
      socket.on("getSupporters", async () => {
        try {
          await SocketrateLimiter.consume(socket.id);
          Supporters.find({}).then(async (supporter)=>{
            if(supporter && supporter.length>0){
              var supportersData =[];
              supporter[0].supporters.forEach(
                (eachSupporter) => {

                  if(eachSupporter.public){
                    supportersData.push({ name: eachSupporter.name, img: eachSupporter.img });
                  }                  
                },
              );
              socket.emit("Supporters",supportersData);
            }
          })
        } catch (error) {
          console.error(error);
        }
      });
      // new pledge
      socket.on("newPledge", async (newdata) => {
        // save pledge to transaction
        try {
          await SocketrateLimiter.consume(socket.id);
          if(!parseFloat(newdata.pledgeAmount)) return socket.emit("error",{message: "pls enter a good amount"});
          if (newdata.email && !validator.isEmail(newdata.email))
            return socket.emit("error", { message: "invalid email" });
          var data = {
            name: newdata.name.toString().escape(),
            pledgeAmount: parseFloat(newdata.pledgeAmount),
            email: newdata.email.toString().escape(),
            public: newdata.public,
          };
          data.createdAt = Date.now();
          data.status = "pending";
          data.exchangeRate = 570;
          // naira value 
          data.nairaAmount = data.pledgeAmount * data.exchangeRate;
          if (
            data.name &&
            data.name.trim().length > 3 &&
            data.email && data.email.length<101 &&
            data.pledgeAmount
          ) {
            var newSupporter = new Transaction(data);
            newSupporter
              .save()
              .then((resp) => {
                const form = {
                  reference: resp._id,
                  email: resp.email,
                  amount: resp.nairaAmount * 100,
                  currency: "NGN",
                  callback_url: `${paymentRedirectUrl}`,
                  cancel_action: `${hostUrl}`,
                  payment_options: "card",
                  metadata: {
                    consumer_id: resp._id,
                    consumer_mac: "92a3-912ba-1192a",
                    custom_fields: [
                      {
                        display_name: resp.name,
                      },
                    ],
                  },
                  customer: {
                    email: resp.email,
                    name: resp.name,
                  },
                };
                // initializePayment
                initializePayment(JSON.stringify(form), socket);
              })
              .catch(console.log);
          }
        } catch (error) {
          console.error(error);
        }
      });

    });
};