'use strict';
module.exports = function(app) {
  var Language = require('../controllers/LanguageController');

  app.route('/language')
    .get(Language.list);
};