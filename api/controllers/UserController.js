'use strict';
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var qt = require('quickthumb');
var imageSize = require('image-size');

var dirname = "./images";

var mongoose = require('mongoose'),
  User = mongoose.model('User');

exports.register = function(req, res) {
  var new_user = new User(req.body);

  User.findOne({username: req.body.username}, function(err, user) {
    if (err)
      res.json({success: false, error: "Unexpected error while registering user", errorMessage: err});
    if(user === null){ // If no user already exist with this name
      User.findOne({mailAddress: req.body.mailAddress}, function(err, user) {
        if (err)
          res.json({success: false, error: "Unexpected error while registering user", errorMessage: err});
        if (user === null) {
          new_user.save(function (err, user) {
            if (err)
              res.json({success: false, error: "Unexpected error while registering user", errorMessage: err});
            res.json({success: true, username: user.username});
          });
        }
        else{
          res.json({success: false, error: "An account is already linked to this mail address !"});
        }
      });
    }
    else {
      res.json({success: false, error: "Username \"" +user.username + "\" already taken !"});
    }
  });
};

exports.connect = function (req, res) {
  User.findOne({username: req.body.username, password: req.body.password}, function(err, user) {
    if (err)
      res.send(err);
    if(user !== null) {
      var token = Date.now() + '-NC';
      User.findOneAndUpdate({_id: user._id}, {token: token}, function (err, user) {
        if(err)
          res.send(err);
        if(user !== null){
          res.json({success: true, token: token});
        }
        else{
          res.json({success: false, error: 'Unexpected error while updating the token'});
        }
      });
    }
    else{
      res.json({success: false, error: 'Bad username or password.'});
    }
  });
};

exports.disconnect = function (req, res) {
  User.findOneAndUpdate({token: req.body.token}, {token: ''}, {new: true}, function (err, user) {
    if(err)
      res.send(err);
    if(user !== null){
      res.json({success: true});
    }
    else{
      res.json({success: false, error: 'Unexpected error while disconnecting'});
    }
  });
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

exports.updateAvatar = function (req, res) {
  var form = new formidable.IncomingForm();
  form.multiples = false;
  form.uploadDir = dirname;

  form.parse(req, function(err, fields, files) {
    User.findOne({token: fields.token}, function (err, user) {
      if(err)
        res.send(err);
      else if(user !== null){
        if(files.img.size > 2000000) {
          res.json({success: false, error: 'Image size is bigger than 2Mo'});
          return;
        }
        else if(files.img.type !== 'image/jpeg' && files.img.type !== 'image/png' && files.img.type !== 'image/gif') {
          res.json({success: false, error: 'Image type is not jpg/jpeg, png or gif'});
          return;
        }

        var newFileName = user.username;
        var fileExt = files.img.name.split('.').pop();
        var filePath = path.join(form.uploadDir, newFileName + '.' + fileExt);

        var convertArgs = {
          src: filePath,
          dst: filePath,
          width:  120,
          height: 120
        };

        fs.rename(files.img.path, filePath, function () {
          qt.convert(convertArgs, function (err, stdout, stderr) {
            if (err) {
              res.json({success: false, error: 'Error while converting.'});
              return;
            }
            User.findOneAndUpdate({token: fields.token}, {avatarUrl: filePath}, {new: true}, function (err, user) {
              if(err)
                res.send(err);
              else if(user !== null){
                res.json({success: true});
              }
              else{
                res.json({success: false, error: 'Unexpected error while updating user avatar'});
              }
            });
          });
        });
      }
      else{
        res.json({success: false, error: 'User not found'});
      }
    });
  });
};