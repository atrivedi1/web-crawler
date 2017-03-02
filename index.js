'use strict'

//dependencies
var express = require('express');
var bodyParser = require('body-parser');

//create instance of express
var app = express();

//middleware
app.use(express.static('client'));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));
  
//connect on routes
require('./server/routes.js')(app)

//set up port to listen on
var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Web crawler listening on port ' + port + '!');
});