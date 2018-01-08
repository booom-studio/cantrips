'use strict'

const fs = require('fs')
const path = require('path')
const winston = require('winston')

winston.emitErrs = true
const logFolder = './logs'

if (!fs.existsSync(logFolder)) {
  fs.mkdirSync(logFolder)
}

module.exports = (new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: path.join(logFolder, 'log.log'),
      handleExceptions: true,
      json: true,
      maxsize: 5242880,
      maxFiles: 5,
      colorize: false
    }),
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
}))
