'use strict';


var mongoose = require('mongoose'),
  User = mongoose.model('User');

exports.register = function(req, res) {
  var new_user = new User(req.body);

  User.findOne({username: req.body.username}, function(err, user) {
    if (err)
      res.send(err);
    console.log(user);
    if(user === null){ // If no user already exist with this name
      new_user.save(function(err, user) {
        if (err)
          res.send(err);
        res.json(user);
      });
    }
    else {
      res.json({error: "Username already taken !"});
    }
  });
};

exports.connect = function (req, res) {
  console.log("a user want to connect !");
  res.send("a user want to connect !");
};

exports.disconnect = function (req, res) {
  console.log("a user want to diconnect !");
  res.send("a user want to diconnect !");
};

exports.list = function (req, res) {
  User.find({}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};

exports.getOne = function (req, res) {
  User.findOne({username: req.params.username}, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};