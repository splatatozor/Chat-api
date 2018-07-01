var mongoose = require('mongoose');
var User = mongoose.model('User');
var Discussion = mongoose.model('Discussion');
var discussionController = require('./controllers/DiscussionController');

connectedUsers = {};
tokenToUsername = {};
connectedSockets = {};


// This function is executed for each user that connect to the socket
// Variables in this function are unique for each user
// Use socket.emit() to send data to the user
// Use io.emit() to send data to all users
// Use io.to().emit() to send data to all user in a "room"
module.exports = function(io) {
  function init(socket) {
    console.log("hey");

    var handler = setInterval(function () {
      socket.emit('stayAwake');
    }, 2000);

    socket.on('disconnect', function (){
      clearInterval(handler);
      io.emit('connectedUser', {status: false, user: tokenToUsername[connectedSockets[socket.id]]});
      delete connectedUsers[tokenToUsername[connectedSockets[socket.id]]];
      delete tokenToUsername[connectedSockets[socket.id]];
      delete connectedSockets[socket.id];
      console.log("user disconnected !");
    });

    socket.on('message', function (data) {
      socket.emit('msg', "ok gret !" + data);
    });

    socket.on('getConnectedFriends', function () {
      console.log("search friends !!!!!");
      User.findOne({token: connectedSockets[socket.id]}, function(err, user) {
          if (err)
            socket.emit('error', {msg: "error on database connection while getting friends"});
          if(user !== null){
            for(var i = 0; i < user.friends.length; i++){
              if(user.friends[i].length < 2){
                continue;
              }
              console.log("u"+user.friends[i]+"u");
              var friend = user.friends[i];
              var status = false;
              if (connectedUsers.hasOwnProperty(friend)) {
                status = true;
              }
              socket.emit('connectedFriends', {status: status, username: friend});
            }
          }
        }
      );
    });

    socket.on('addDiscussionMessage', function (data) {
      discussionController.checkUsers(data.user1, data.user2, data.token).then(function (res) {
        Discussion.findOne({user1: data.user1, user2: data.user2}, function (err, discussion) {
          if(err) {
            socket.emit('getDiscussion', {success: false, error: 'unexpected error while finding discussion', errCode: 'unexpected'});
            return;
          }
          if(discussion !== null){
            discussion.messages.push({message: data.message, date: Date.now()});
            discussion.save(function (err, dis) {
              socket.emit('getDiscussion', {success: true, user: data.user2, discussion: discussion.messages});
              if(connectedUsers.hasOwnProperty(data.user2))
                connectedUsers[data.user2].emit('getDiscussion', {success: true, user: data.user1, discussion: discussion.messages});
            });
          }
          else{
            Discussion.findOne({user1: data.user2, user2: data.user1}, function (err, discussion) {
              if(err) {
                socket.emit('getDiscussion', {success: false, error: 'unexpected error while finding discussion', errCode: 'unexpected'});
                return;
              }
              if(discussion !== null){
                discussion.messages.push({message: data.message, date: Date.now()});
                discussion.save(function (err, dis) {
                  socket.emit('getDiscussion', {success: true, user: data.user2, discussion: discussion.messages});
                  if(connectedUsers.hasOwnProperty(data.user2))
                    connectedUsers[data.user2].emit('getDiscussion', {success: true, user: data.user1, discussion: discussion.messages});
                });
              }
              else{
                socket.emit('getDiscussion', {success: false, error: "can't find the discussion", errCode: 'cannot_find'});
              }
            });
          }
        });
      })
    });

    socket.on('custom_connect', function (data) {
      console.log("get a connect from " + data.username);
      connectedUsers[data.username] = socket;
      connectedSockets[socket.id] = data.token;
      tokenToUsername[data.token] = data.username;
      io.emit('connectedUser', {status: true, user: data.username});
    })
  }

  io.on('connection', init);
};