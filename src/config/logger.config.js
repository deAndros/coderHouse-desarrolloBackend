const winston = require('winston')
const { app_mode } = require('../config/object.config')

const customLevelOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: 'red',
    error: 'red',
    warning: 'yellow',
    info: 'blue',
    http: 'green',
    debug: 'grey',
  },
}

let logger

switch (app_mode) {
  case 'development':
    logger = winston.createLogger({
      levels: customLevelOptions.levels,
      transports: [
        new winston.transports.Console({
          //Si se inicializa la app en modo desarrollo, logea a partir de debug, sino lo hace a partir de info.
          level: 'debug',
          format: winston.format.combine(
            winston.format.colorize({ colors: customLevelOptions.colors }),
            winston.format.simple()
          ),
        }),
      ],
    })
    break
  case 'production':
    logger = winston.createLogger({
      levels: customLevelOptions.levels,
      transports: [
        new winston.transports.Console({
          //Si se inicializa la app en modo desarrollo, logea a partir de debug, sino lo hace a partir de info.
          level: 'info',
          format: winston.format.combine(
            winston.format.colorize({ colors: customLevelOptions.colors }),
            winston.format.simple()
          ),
        }),
        new winston.transports.File({
          filename: './src/logs/errors.log',
          level: 'error',
          format: winston.format.simple(),
        }),
      ],
    })
    break
  default:
    break
}

const addLogger = (request, response, next) => {
  request.logger = logger
  request.logger.http(
    `${request.method} en ${request.url} - ${new Date().toLocaleTimeString()}`
  )
  next()
}

module.exports = {
  logger,
  addLogger,
}
