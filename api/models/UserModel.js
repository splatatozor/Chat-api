'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = new Schema({
  username: {
    type: String,
    required: 'username'
  },
  password: {
    type: String,
    required: 'password'
  },
  fullName: {
    type: String,
    required: 'full name'
  },
  birthDate: {
    type: Date,
    required: 'birth date'
  },
  country: {
    type: Number,
    required: 'country'
  },
  language: {
    type: Number,
    required: 'Language'
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  mailAddress: {
    type: String,
    required: 'mail address'
  },
  friends: {
    type: [String],
    default: ''
  },
  friendsRequests: {
    type: [String]
  },
  registrationDate: {
    type: Date,
    default: Date.now()
  },
  token: {
    type: String,
    default: ''
  },
  deletedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('User', UserSchema);