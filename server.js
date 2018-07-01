var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  User = require('./api/models/UserModel'), //created model loading here
  Country = require('./api/models/CountryModel'), //created model loading here
  Language = require('./api/models/LanguageModel'), //created model loading here
  bodyParser = require('body-parser')
  SocketManager = require('./api/SocketManager');

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});


function init(err, db) {
  Country.init(db);
  Language.init(db);
}

//mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/nochat', init).then(function (ok) {
  //console.log(ok);
}).catch(function (err) {
  console.log(err);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var userRoutes = require('./api/routes/UserRoutes'); //importing route
userRoutes(app); //register the route
var countryRoutes = require('./api/routes/CountryRoutes'); //importing route
countryRoutes(app); //register the route
var languageRoutes = require('./api/routes/LanguageRoutes'); //importing route
languageRoutes(app); //register the route

var server = app.listen(port);

io = module.exports.io = require('socket.io').listen(server);

SocketManager(io);

console.log('todo list RESTful API server started on: ' + port);