'use strict';
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var qt = require('quickthumb');
var imageSize = require('image-size');
var crypto = require('crypto');

var dirname = "./images";

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Language = mongoose.model('Language');
var Country = mongoose.model('Country');

const io = require('../../server.js').io;

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
          new_user.password = crypto.createHash('md5').update(new_user.password).digest("hex");
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
  req.body.password = crypto.createHash('md5').update(req.body.password).digest("hex");
  User.findOne({username: req.body.username, password: req.body.password}, function(err, user) {
    if (err)
      res.send(err);
    if(user !== null) {
      if(user.deletedAt === null) {
        var token = Date.now() + '-NC';
        User.findOneAndUpdate({_id: user._id}, {token: token}, function (err, user) {
          if (err)
            res.send(err);
          if (user !== null) {
            res.json({success: true, token: token});

          }
          else {
            res.json({success: false, error: 'Unexpected error while updating the token', errCode: 'unexpected'});
          }
        });
      }
      else{
        res.json({success: false, error: 'This user has deleted his account', errCode: 'deleted'});
      }
    }
    else{
      res.json({success: false, error: 'Bad username or password.', errCode: 'credentials'});
    }
  });
};

exports.delete = function (req, res) {
  User.findOneAndUpdate({token: req.body.token}, {deletedAt: Date.now()}, {new: true}, function (err, user) {
    if (err)
      res.json({success: false, error: 'Unexpected error while deleting an user'});
    else {
      if(user === null)
        res.json({success: false, error: 'No user to delete or bad token'});
      else
        res.json({success: true, msg: 'User correctly deleted'});
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
  if(req.params.username === "search") {
    res.json({success: false, error: 'bad request', errCode: 'request'})
  }
  else{
    User.findOne({username: req.params.username}, function (err, user) {
      if (err)
        res.send(err);
      else {
        Language.findOne({id: user.language}, function (err, lang) {
          Country.findOne({id: user.country}, function (err, country) {
            user = user.toJSON();
            user.language = lang.label;
            user.country = country.label;
            user.password = 'hidden';
            user.token = 'hidden';
            res.json(user);
          });
        });
      }
    });
  }
};

exports.getUser = function (req, res) {
  User.findOne({token: req.query.token}, function(err, user) {
    if (err)
      res.send(err);
    else {
      Language.findOne({id: user.language}, function(err, lang) {
        Country.findOne({id: user.country}, function(err, country) {
          user = user.toJSON();
          user.language = lang.label;
          user.country = country.label;
          res.json(user);
        });
      });
    }
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
          res.json({success: false, error: 'Image size is bigger than 2Mo', errCode:"size"});
          return;
        }
        else if(files.img.type !== 'image/jpeg' && files.img.type !== 'image/png' && files.img.type !== 'image/gif') {
          res.json({success: false, error: 'Image type is not jpg/jpeg, png or gif', errCode:"type"});
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

exports.addFriend = function (req, res) {
  User.findOne({username: req.body.username}, function (err, futureFriend) {
    if(err)
      res.json({success: false, error: 'Unexpected error while searching future friend'});
    if(futureFriend !== null){
      User.findOne({token: req.body.token}, function (err, user) {
        if(err)
          res.json({success: false, error: 'Unexpected error while updating friends'});
        if(user !== null){
          user.friends.push(futureFriend.username);
          user.save(function (err) {
            if(err){
              res.json({success: false, msg: 'Error while adding friend'});
            }
            else{
              if(futureFriend.friendsRequests.contains(user.username)) {
                res.json({success: false, msg: 'Friend already added'});
              }
              else{
                futureFriend.friendsRequests.push(user.username);
                futureFriend.save(function (err) {
                  if (err) {
                    res.json({success: false, msg: 'Error while adding friend request'});
                  }
                  else {
                    res.json({success: true, msg: 'Friend correctly added'});
                  }
                });
              }
            }
          });
        }
        else{
          res.json({success: false, error: 'Error while getting user'});
        }
      });
    }
    else{
      res.json({success: false, error: 'Unexpected error while adding friend : no user found with this user name'});
    }
  });
};

exports.removeFriend = function (req, res) {
  User.findOne({token: req.body.token}, function (err, user) {
    if(err)
      res.json({success: false, error: 'Error while getting user'});
    if(user !== null){
      var friend = req.body.friend;
      console.log(user.friends);
      var indexOfFriend = user.friends.indexOf(friend);
      if(indexOfFriend < 0){
        res.json({success: false, error: friend + " is not your friend", errCode: "not_friend"});
      }
      else {
        user.friends = user.friends.slice(indexOfFriend, 1);
        console.log(indexOfFriend);
        console.log(user.friends);
        user.save(function (err) {
          if(err){
            res.json({success: false, error: "Error while saving user", errCode: "cannot_save"});
          }
          else{
            res.json({success: true});
          }
        });
      }
    }
    else{
      res.json({success: false, error: 'Error while getting friends', errCode: "get_friends"});
    }
  });
};

exports.getFriends = function (req, res) {
  User.findOne({username: req.params.username}, function (err, user) {
    if(err)
      res.json({success: false, error: 'Unexpected error while updating friends'});
    if(user !== null){
      res.json({success: true, friends: user.friends});
    }
    else{
      res.json({success: false, error: 'Error getting friends'});
    }
  });
};

exports.getAvatar = function (req, res){
  console.log(req.params.username);
  User.findOne({username: req.params.username}, function (err, user) {
    if (err) {
      throw err
    } else {
      if (user !== null) {
        if (user.avatarUrl !== '') {
          var path = user.avatarUrl;
          var imgType = path.split('.');
          imgType = imgType[imgType.length - 1];
          if (imgType === "jpg")
            imgType = "jpeg";
          var img = fs.readFileSync(path);
          res.writeHead(200, {'Content-Type': 'image/' + imgType});
          res.end(img, 'binary');
        }
        else {
          var img = fs.readFileSync('otherFiles/noAvatar.png');
          res.writeHead(200, {'Content-Type': 'image/png'});
          res.end(img, 'binary');
        }
      }
      else {
        var img = fs.readFileSync('otherFiles/noAvatar.png');
        res.writeHead(200, {'Content-Type': 'image/png'});
        res.end(img, 'binary');
      }
    }
  })
};

exports.search = function (req, res) {
  console.log("gonna search : " + req.params.username);
  User.find({username: new RegExp('^.*'+req.params.username+'.*$', "i")}, function(err, users) {
    if (err)
      res.send(err);
    else {
      var _users = [];
      for(var i in users){
        _users.push({username: users[i].username, mailAddress: users[i].mailAddress});
      }
      res.json({success: true, users: _users, id: req.query.id});
    }
  });
};