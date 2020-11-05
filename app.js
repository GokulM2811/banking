require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');


const appid = process.env.MONGOOSE_ID;

mongoose.connect("mongodb+srv://admin-gokul:" + appid +"@cluster0.f8i4r.mongodb.net/bankDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set('useFindAndModify', false);

const app = express();

app.set('view engine', 'ejs');

const userschema = new mongoose.Schema({
  name: String,
  email: String,
  balance: Number,
  age: Number,
  location: String,
  accountno: Number
});

const transactionschema = new mongoose.Schema({
  sender: String,
  reciever: String,
  amount: Number
});

const Transaction = mongoose.model("Transaction", transactionschema);
const User = mongoose.model("User", userschema);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  res.render("home.ejs")
});

app.get("/transactions", function(req, res) {
  Transaction.find({}, function(err, pasttrans) {
    res.render("transactions", {
      detail: pasttrans
    });
  });
});

app.get("/details", function(req, res) {
  User.find({}, function(err, users) {
    res.render("details", {
      detail: users
    });
  });
});

app.post("/details2", function(req, res) {
  User.find({}, function(err, users) {
    res.render("details2", {
      sender: req.body.usersid,
      detail: users
    });
  });
});

app.post("/transfer", function(req, res) {
  res.render("transfer", {
    sends: req.body.usersfrom,
    recieves: req.body.usersto
  });
});

app.post("/complete", function(req, res) {
  let from = req.body.from;
  let to = req.body.to;
  let fund = req.body.amount;
  if (fund > 0) {
    User.findOne({
      name: from
    }, function(err, send) {
      if (!err) {
        if (send.balance >= fund) {
          User.findOneAndUpdate({
            name: from
          }, {
            $set: {
              balance: Number(send.balance) - Number(fund)
            }
          }, function(err, result) {
            if (!err) {}
          });
          User.findOne({
            name: to
          }, function(err, getter) {
            if (!err) {
              User.findOneAndUpdate({
                name: to
              }, {
                $set: {
                  balance: Number(getter.balance) + Number(fund)
                }
              }, function(err, result) {
                if (!err) {}
              });
            }
          });
          const trans = new Transaction({
            sender: from,
            reciever: to,
            amount: fund
          });
          trans.save(function(err) {
            if (!err) {
              res.render("failure",{
                error: 2
              });
            }
          });
        } else {
          res.render("failure",{
            error: 0
          });
        }
      }
    });
  } else {
    res.render("failure",{
      error: 1
    });
  }
});

app.get("/:username", function(req, res) {
  let search = req.params.username;
  User.findOne({
    name: search
  }, function(err, item) {
    res.render("info", {
      display: item
    });
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 4000;
}

app.listen(port, function() {
  console.log("Server started on port 4000");
});