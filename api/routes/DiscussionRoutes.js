'use strict';
module.exports = function(app) {
  var Discussion = require('../controllers/DiscussionController');

  app.route('/discussion')
    .get(Discussion.getOne);
};