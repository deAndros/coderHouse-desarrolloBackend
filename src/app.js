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

const logger = require('morgan')
app.use(logger('dev'))

//Socket IO
const { Server } = require('socket.io')

const httpServer = app.listen(PORT, (error) => {
  if (error) console.log('Se produjo un error en el servidor: ', error)
  console.log(`Escuchando en el puerto ${PORT}`)
})

const socketServer = new Server(httpServer)

//Real Time Products
const productsSocket = require('./utils/products.socket.js')
productsSocket(socketServer)

//Handlebars
//TODO: No funciona la vista de productos. Arreglarla
const handlebars = require('express-handlebars')
app.engine('handlebars', handlebars.engine()) //Inicializo el engine de handlebars
app.set('views', __dirname + '/views') //Le digo a mi app donde están mis vistas
app.set('view engine', 'handlebars') //Le digo a mi app que lo use

//Uso de Passport
initPassport()
initPassportGithub()
passport.use(passport.initialize())

//Routers
const appRouter = require('./routes/index.router')
const { errorHandler } = require('./middlewares/error.middleware')
app.use(appRouter)

//Manejo de ERRORES
app.use(errorHandler)
/*app.use((error, request, response, next) => {
  console.log(error)
  response.status(500).send('Se produjo un error inesperado ' + error)
})*/
