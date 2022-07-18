"use strict";

// everything about users;
const express = require("express");
const {models } = require("../utils/mongoose-connection");
const router = express.Router();

var {Transaction,Supporters, singlesupporter } = models();

const {verifyPayment } = require("../utils/payment.js")();

// rewards ={id,minAmount,description}
// create a new transaction = {yourDetails, pending: true}
// create/make a payment = {transactionID,amount,date}
// create a supporter ={yourDetails,rewardForYou,rewardID}
          // rewardForYou has to be verified to ensure you paid the right amount
function RewardForyou(amount){
  if (amount >= 5000) return "rhodium";
  if (amount >= 1000) return "platinum";
  if (amount >= 100) return "gold";
  if (amount >= 50) return "ruthenium";
  if (amount >= 10) return "iridium";
  if (amount >= 1) return "silver";
}

router.route("/verifypay").get((req, res) => {
  // if (req.query.status&& req.query.status === "cancelled")
  //   return res.redirect("/");
  var confirm = req.query;
  var transactionId = `${req.query.trxref}`;
  if(!transactionId) return res.status(400).json({message: "tx_ref required"});
  try {
    Transaction.find({ _id: transactionId }).then(async (transactionData)=>{
      if(!transactionData || transactionData.length ===0) return res.status(403).json({ message:"transaction does not exist"  });
      if(transactionData[0].status === "paid") return res.status(403).json({ message: "transaction verified already" });
      verifyPayment(
        router,
        confirm,
        res,
        transactionData,
        Supporters,
        singlesupporter,
        RewardForyou,
      );
    }).catch(console.log);
    } catch (error) {
      res.end()
      console.error("hi",error)
    }
});

module.exports = router;
