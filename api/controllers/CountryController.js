'use strict';
var mongoose = require('mongoose'),
  Country = mongoose.model('Country');

exports.list = function (req, res) {
  Country.find({}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};