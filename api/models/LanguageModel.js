'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var languages = [
  [1, 'French'],
  [2, 'Ethiopian'],
  [3, 'Mexican'],
  [4, 'English'],
  [5, 'Korean'],
  [6, 'Swedish'],
  [7, 'German']
];


var LanguageSchema = new Schema({
  id: {
    type: Number,
    required: 'id'
  },
  label: {
    type: String,
    required: 'label'
  }
});

module.exports = mongoose.model('Language', LanguageSchema);

var init = function (db) {
  var self = this;
  var _collections = [];
  db.db.listCollections().toArray(function(err, collections){
    for(var i in collections){
      _collections.push(collections[i].name);
    }
    if(_collections.indexOf('languages') !== -1){
      console.log('"languages" collection already loaded !');
    }
    else {
      console.log('Need to create "languages" collection !');
      for(var i in languages){
        var lang = languages[i];
        var new_lang = new self();
        new_lang.id = lang[0];
        new_lang.label = lang[1];
        new_lang.save();
      }
    }
  });
};

module.exports.init = init;