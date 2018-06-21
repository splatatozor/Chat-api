var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  User = require('./api/models/UserModel'), //created model loading here
  Country = require('./api/models/CountryModel'), //created model loading here
  bodyParser = require('body-parser');

var cors = require('cors');
app.use(cors({credentials: true, origin: ['*']}));


function init(err, db) {
  console.log(db);
  Country.init(db);
}

//mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/nochat', init);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/UserRoutes'); //importing route
routes(app); //register the route

app.listen(port);

console.log('todo list RESTful API server started on: ' + port);