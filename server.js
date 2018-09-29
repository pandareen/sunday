var morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/db');
var winston = require('./config/winston-logger');
const http = require('http');
const uuid = require('uuid');
// Create a namespace
const { createNamespace, getNamespace } = require('node-request-context');
const namespace = createNamespace('myapp.mynamespace');

var mongoose = require('mongoose')


const app = express();



const port = 8080;

app.use(morgan('combined', { stream: winston.stream }))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

namespace.run(() => {
  const transactionId = uuid.v1();

  // Set any variable using the set function
  namespace.set('tid', transactionId);
  console.log(namespace.get('tid'))

  mongoose.connect(db.url, { useCreateIndex: true, useNewUrlParser: true }, (err, mg) => {
    if (err) return console.log(err)
    require('./app/routes')(app, mg);
    app.listen(port, () => {

      console.log('We are live on ' + port);
    });
  })
});
