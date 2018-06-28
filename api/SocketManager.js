const io = require('./server.js').io;
var mongoose = require('mongoose');
var User = mongoose.model('User');

connectedUsers = {};
connectedSockets = {};


// This function is executed for each user that connect to the socket
// Variables in this function are unique for each user
// Use socket.emit() to send data to the user
// Use io.emit() to send data to all users
// Use io.to().emit() to send data to all user in a "room"
module.exports = function() {
  function init(socket) {
    var handler = setInterval(function () {
      socket.emit('stayAwake');
    }, 2000);

    socket.on('disconnect', function (){
      clearInterval(handler);
      delete connectedUsers[connectedSockets[socket.id]];
      delete connectedSockets[socket.id];
      console.log("user disconnected !");
    });

    socket.on('message', function (data) {
      socket.emit('msg', "ok gret !" + data);
    });

    socket.on('connect', function (data) {
      connectedUsers[data.username] = socket;
      connectedUsers[socket.id] = data.username;
      io.emit('connected', data.username)
    })
  }

  io.on('connection', init);

  function userConnected(username) {

  }
};