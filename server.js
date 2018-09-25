const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/db');

var mongoose = require('mongoose')


const app = express();

 
const port = 8080;
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));  
mongoose.connect(db.url, { useCreateIndex: true, useNewUrlParser: true }, (err, mg) => {
  if (err) return console.log(err)
  require('./app/routes')(app, mg);
  app.listen(port, () => {
    console.log('We are live on ' + port);
  });
})
