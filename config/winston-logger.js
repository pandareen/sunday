var appRoot = require('app-root-path');
var winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
  });

// define the custom settings for each transport (file, console)
var options = {
  file: {
    filename: `${appRoot}/logs/app.log`
  }
};

// instantiate a new Winston Logger with the settings defined above
var logger = winston.createLogger({
    format: combine(
        label({ label: 'right meow!' }),
        timestamp(),
        myFormat
    ),
  transports: [
    new winston.transports.File(options.file),
    //new winston.transports.Console(options.console)
  ],
  exitOnError: false, // do not exit on handled exceptions
});



// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = logger;