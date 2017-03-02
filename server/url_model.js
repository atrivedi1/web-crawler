//set up db
var mongoose = require('mongoose');
var database = 'mongodb://localhost/web_crawler';
mongoose.connect(database);

//Bind connection to error event;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Schema = mongoose.Schema;

var urlSchema = new Schema({
  "URL":  String,
  "Phone Numbers": Array
});

var urlModel = mongoose.model("Url", urlSchema, "web_crawler");

module.exports = urlModel;