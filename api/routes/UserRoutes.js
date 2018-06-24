'use strict';
module.exports = function(app) {
  var User = require('../controllers/UserController');

  // todoList Routes
  app.route('/user/registration')
    .post(User.register);


  app.route('/user/connection')
    .post(User.connect);
  app.route('/user/disconnection')
    .post(User.disconnect);

  app.route('/user')
    .get(User.list);

  app.route('/user/me')
    .get(User.getUser);

  app.route('/user/:username')
    .get(User.getOne);

  app.route('/user/avatar')
    .put(User.updateAvatar);

  app.route('/user/delete')
    .delete(User.delete);
};