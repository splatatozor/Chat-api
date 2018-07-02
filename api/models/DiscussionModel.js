'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var DiscussionSchema = new Schema({
  user1: {
    type: String,
    required: 'user1'
  },
  user2: {
    type: String,
    required: 'user2'
  },
  messages: {
    type: [{message: String, date: Date, user: String}],
    default: []
  }
});

module.exports = mongoose.model('Discussion', DiscussionSchema);