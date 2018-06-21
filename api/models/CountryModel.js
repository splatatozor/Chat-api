'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var countries = [
  ['FRA', 'France'],
  ['Oth', 'Other']
];


var CountrySchema = new Schema({
  id: {
    type: String,
    required: 'id'
  },
  label: {
    type: String,
    required: 'label'
  }
});

var init = function (db) {
  console.log(Object.keys(db.modelSchemas));
  if(Object.keys(db.modelSchemas).includes('Country')){
    console.log('Country collection already loaded !');
  }
  else {
    console.log('Need to create Country collection !');
    for(var i in countries){
      var country = countries[i];
      var new_country = new CountrySchema();
      new_country.id = country[0];
      new_country.label = country[1];
      new_country.save();
    }
  }
  module.exports = mongoose.model('Country', CountrySchema);
};

module.exports.init = init;