const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/db');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const fs = require('fs');
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

var mongoose = require('mongoose')


const app = express();

const logger = createLogger({
  format: combine(
    label({ label: 'right meow!' }),
    timestamp(),
    myFormat
  ),
  transports: [new transports.File({ filename: './logs/combined.log', level: 'debug', timestamp: true })]
});

const port = 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
mongoose.connect(db.url, { useCreateIndex: true, useNewUrlParser: true }, (err, mg) => {
  if (err) return console.log(err)
  require('./app/routes')(app, mg);
  app.listen(port, () => {
    console.log('We are live on ' + port);
  });
})
