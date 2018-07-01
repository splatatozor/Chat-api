'use strict';
var mongoose = require('mongoose');
var Discussion = mongoose.model('Discussion');
var User = mongoose.model('User');

var checkUsers = exports.checkUsers = function (user1, user2, token) {
  return new Promise(function(resolve, reject) {
    User.findOne({token: token, username: user1}, function (err, user) {
      if (err)
        return 'unexpected error';
      if (user !== null) {
        User.findOne({username: user2}, function (err, friend) {
          if (err)
            reject('unexpected error');
          if (friend !== null) {
            resolve({success: true});
          }
          else {
            resolve({success: false, error: 'cannot find the friend', errCode: 'no_friend'});
          }
        });
      }
      else {
        resolve({success: false, error: 'cannot find the user', errCode: 'no_user'});
      }
    });
  });
};

exports.getOne = function (req, res) {
  console.log(req.query);
  checkUsers(req.query.user1, req.query.user2, req.query.token).then(function(data) {
    if(data.success) {
      Discussion.findOne({user1: req.query.user1, user2: req.query.user2}, function (err, discussion) {
        if (err) {
          res.json({success: false, error: "Unexpected error while searching discussion", errorMessage: err});
          return;
        }
        if (discussion !== null) {
          res.json({success: true, discussion: discussion.messages});
        }
        else {
          Discussion.findOne({user1: req.query.user2, user2: req.query.user1}, function (err, discussion) {
            if (err) {
              res.json({success: false, error: "Unexpected error while searching discussion", errorMessage: err});
              return;
            }
            if (discussion !== null) {
              res.json({success: true, discussion: discussion.messages});
            }
            else {
              var discussion = new Discussion();
              discussion.user1 = req.query.user1;
              discussion.user2 = req.query.user2;
              discussion.save(function (err, user) {
                if (err)
                  res.json({success: false, error: "Unexpected error while creating discussion", errorMessage: err});
                res.json({success: true, discussion: discussion.messages});
              });
            }
          });
        }
      });
    }
    else {
      res.json(data);
    }
  });
};