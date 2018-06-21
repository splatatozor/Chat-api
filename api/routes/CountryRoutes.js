'use strict';
module.exports = function(app) {
  var Country = require('../controllers/CountryController');

  app.route('/country')
    .get(Country.list);
};