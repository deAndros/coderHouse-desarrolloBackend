//DB Config
const { PORT } = require('./config/object.config')

//Passport
const { initPassport, initPassportGithub } = require('./config/passport.config')
const passport = require('passport')

//Express
const express = require('express')
const app = express()

//Cors
//Acepto peticiones desde cualquier front externo si paso el cors sin objeto de configuración
const cors = require('cors')
app.use(cors())

//Compression
//const compression = require('express-compression')

//app.use(compression()) //GZip Compression
//app.use(compression({ brotli: { enable: true, zlib: {} } })) //Brotli Compression

//Middlewares Nativos de Express
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/static', express.static(__dirname + '/public')) //static es una carpeta virtual, creada por el middleware. Podría ponerle otro nombre si quisiera.

//Middlewares de Terceros
const cookieParser = require('cookie-parser')
app.use(cookieParser('S3c123t'))

//Configuración de SWAGGER
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUiExpress = require('swagger-ui-express')

const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'Documentación de Power Comics API',
      description: 'Se incluyen: carts.yaml y products.yaml',
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
}

const specs = swaggerJsDoc(swaggerOptions)

app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

/*const logger = require('morgan')
app.use(logger('dev'))*/

//Socket IO
const { Server } = require('socket.io')

//Logging
const { logger, addLogger } = require('./config/logger.config')
app.use(addLogger)

const httpServer = app.listen(PORT, (error) => {
  if (error) logger.fatal('Se produjo un error en el servidor: ', error)
  logger.info(`Escuchando en el puerto ${PORT}`)
})

//Inicializo el socket server del lado del servidor
const socketServer = new Server(httpServer)

//Real Time Products
const productsSocket = require('./sockets/products.socket.js')
productsSocket(socketServer)

//Chat
const chatSocket = require('./sockets/chat.socket.js')
chatSocket(socketServer)

//Handlebars
const handlebars = require('express-handlebars')
const Handlebars = require('handlebars')
app.engine('handlebars', handlebars.engine()) //Inicializo el engine de handlebars
app.set('views', __dirname + '/views') //Le digo a mi app donde están mis vistas
app.set('view engine', 'handlebars') //Le digo a mi app que lo use

//Declaro un helper de handlebars para que me permita manejar lógica utilizando la sentencia custom "ifCond"
Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case '==':
      return v1 == v2 ? options.fn(this) : options.inverse(this)
    case '===':
      return v1 === v2 ? options.fn(this) : options.inverse(this)
    case '!=':
      return v1 != v2 ? options.fn(this) : options.inverse(this)
    case '!==':
      return v1 !== v2 ? options.fn(this) : options.inverse(this)
    case '<':
      return v1 < v2 ? options.fn(this) : options.inverse(this)
    case '<=':
      return v1 <= v2 ? options.fn(this) : options.inverse(this)
    case '>':
      return v1 > v2 ? options.fn(this) : options.inverse(this)
    case '>=':
      return v1 >= v2 ? options.fn(this) : options.inverse(this)
    case '&&':
      return v1 && v2 ? options.fn(this) : options.inverse(this)
    case '||':
      return v1 || v2 ? options.fn(this) : options.inverse(this)
    default:
      return options.inverse(this)
  }
})

//Uso de Passport
initPassport()
initPassportGithub()
passport.use(passport.initialize())

//Routers
const appRouter = require('./routes/index.router')
app.use(appRouter)

//Manejo de ERRORES
const { errorHandler } = require('./middlewares/error.middleware')
app.use(errorHandler)

//TODO: Notificarle al usuario cuando construye mal el JSON en un POST

/*app.use((error, request, response, next) => {
  console.log(error)
  response.status(500).send('Se produjo un error inesperado ' + error)
})*/
