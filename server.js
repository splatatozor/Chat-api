var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  User = require('./api/models/UserModel'), //created model loading here
  bodyParser = require('body-parser');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/nochat');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/UserRoutes'); //importing route
routes(app); //register the route

app.listen(port);

console.log('todo list RESTful API server started on: ' + port);