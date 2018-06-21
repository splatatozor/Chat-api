'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var countries = [
  [1, 'France'],
  [2, 'Monaco'],
  [3, 'Ethiopia'],
  [4, 'Mexico'],
  [5, 'Korea'],
  [6, 'Sweden'],
  [7, 'Germany']
];


var CountrySchema = new Schema({
  id: {
    type: Number,
    required: 'id'
  },
  label: {
    type: String,
    required: 'label'
  }
});

module.exports = mongoose.model('Country', CountrySchema);

var init = function (db) {
  var self = this;
  var _collections = [];
  db.db.listCollections().toArray(function(err, collections){
    for(var i in collections){
      _collections.push(collections[i].name);
    }
    if(_collections.indexOf('countries') !== -1){
      console.log('"countries" collection already loaded !');
    }
    else {
      console.log('Need to create "countries" collection !');
      for(var i in countries){
        var country = countries[i];
        var new_country = new self();
        new_country.id = country[0];
        new_country.label = country[1];
        new_country.save();
      }
    }
  });
};

module.exports.init = init;