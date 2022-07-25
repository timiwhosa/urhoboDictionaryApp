const paystack = (io) => {
    const https = require("https");
    const MySecretKey =
      "Bearer " + process.env.Secret_key ;

    const initializePayment = (params,socket) => {
          const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/transaction/initialize",
            method: "POST",
            headers: {
              Authorization: MySecretKey,
              "Content-Type": "application/json",
            },
          };
          const req = https
            .request(options, (paystack) => {
              let data = "";
              paystack.on("data", (chunk) => {
                data += chunk;
              });
              paystack.on("end", () => {
                var response = JSON.parse(data);
                if (
                  response.status &&
                  response.data.authorization_url 
                ) {
                  socket.emit("pledgeLink", response);
                } else {
                  socket.emit("error", { message: "pls retry" });
                }
              });
            })
            .on("error", (error) => {
              console.error(error);
            });
          req.write(params);
          req.end();
    };
    const verifyPayment = (
      router,
      confirm,
      routerres,
      transactionData,
      Supporters,
      singlesupporter,
      RewardForyou,
    ) => {
      
      const https = require("https");
      const options = {
        hostname: "api.paystack.co",
        port: 443,
        path: `/transaction/verify/`+ confirm.trxref,
        method: "GET",
        headers: {
          Authorization: MySecretKey,
          "User-Agent": "Chrome/93.0.4577.63",
        },
      };
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", async () => {
          var response = await JSON.parse(data);
          if (
            response.status &&
            response.data.status === "success" &&
            response.data.reference === confirm.reference
          ) {
            var transactionUpdateMain = transactionData[0];
            Supporters.find().then(async (supporter) => {
              var emitNewSupporter = (data) => {
                router.io.sockets.to("privateRoom").emit("Adminnewsupporter", {
                  supporter: data.supporters[0],
                  total: data.total,
                });
                router.io.emit("newsupporter", {
                  supporter: {
                    name: data.supporters[0].name,
                    img: data.supporters[0].img,
                  },
                  total: data.total,
                });

                transactionData[0].status = "paid";
                transactionData[0]
                  .save()
                  .then(() => {
                    routerres.status(200).redirect("/congrats");
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              };
              var transactionUpdate = transactionUpdateMain;
              var namesplit = transactionUpdate.name.trim().split(/[,.\s]/);
              let img =
                namesplit.length > 1
                  ? `https://ui-avatars.com/api/?size=128&name=${namesplit[0]}+${namesplit[1]}&rounded=true&uppercase=true&size=128&bold=true&background=random`
                  : `https://ui-avatars.com/api/?size=128&name=${namesplit[0]}&rounded=true&uppercase=true&size=128&bold=true&background=random`;
              var newSupporterSupporter = await new singlesupporter({
                name: transactionUpdate.name,
                email: transactionUpdate.email,
                img: img,
                contributionId: transactionUpdate._id,
                amount: transactionUpdate.pledgeAmount,
                reward: RewardForyou(transactionUpdate.pledgeAmount),
                public: transactionUpdate.public,
              });
              if (!supporter || supporter.length < 1) {
                var newSupporter = await new Supporters({
                  total: transactionUpdate.pledgeAmount,
                  supporters: [newSupporterSupporter],
                });
                newSupporter
                  .save()
                  .then(emitNewSupporter)
                  .catch((error) => {
                    routerres.status(401).json({ message: "error occured" });
                    console.error(error);
                  });
              } else {
                supporter[0].total =
                  supporter[0].total + transactionUpdateMain.pledgeAmount;
                supporter[0].supporters.push(newSupporterSupporter);
                supporter[0]
                  .save()
                  .then(emitNewSupporter)
                  .catch((err) => {
                    console.error(err);
                  });
              }
            });
          } else {
            // routerres.redirect("/");
            routerres.send(response)


          }
        });
      });
      req.end();
    };
    return {initializePayment,verifyPayment}
}

module.exports = paystack;

