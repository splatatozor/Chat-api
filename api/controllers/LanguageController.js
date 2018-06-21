'use strict';
var mongoose = require('mongoose'),
  Language = mongoose.model('Language');

exports.list = function (req, res) {
  Language.find({}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};