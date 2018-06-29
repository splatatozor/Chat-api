'use strict';
module.exports = function(app) {
  var User = require('../controllers/UserController');

  // todoList Routes
  //region connection/registration/deconnection
  app.route('/user/registration')
    .post(User.register);

  app.route('/user/connection')
    .post(User.connect);

  app.route('/user/disconnection')
    .post(User.disconnect);
  //endregion

  //region search
  app.route('/user/search/:username')
    .get(User.search);
  //endregion

  //region friends
  app.route('/user/friends/add')
    .post(User.addFriend);

  app.route('/user/friends/remove')
    .post(User.removeFriend);

  app.route('/user/friends')
    .get(User.getFriends);
  //endregion

  //region avatar
  app.route('/user/avatar/:username')
    .get(User.getAvatar);

  app.route('/user/avatar')
    .put(User.updateAvatar);
  //endregion

  //region debug
  app.route('/user')
    .get(User.list);
  //endregion

  //region user display
  app.route('/user/me')
    .get(User.getUser);

  app.route('/user/delete')
    .post(User.delete);

  app.route('/user/:username')
    .get(User.getOne);
  //endregion
};