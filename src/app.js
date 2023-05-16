//DB Config
const dbObjectConfig = require('./config/dbObject.config');

//Express
const express = require('express');
const app = express();
const PORT = 8080;

//Middlewares Nativos de Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/static', express.static(__dirname + '/public')); //static es una carpeta virtual, creada por el middleware. Podría ponerle otro nombre si quisiera.

//Middlewares de Terceros
const cookieParser = require('cookie-parser');
app.use(cookieParser('s3c123t'));

const logger = require('morgan');
app.use(logger('dev'));

const session = require('express-session');
app.use(
  session({
    secret: 's3c123t',
    resave: true,
    saveUninitialized: true,
  })
);

//Socket IO
const { Server } = require('socket.io');

const httpServer = app.listen(PORT, (error) => {
  if (error) console.log('Se produjo un error en el servidor: ', error);
  console.log(`Escuchando en el puerto ${PORT}`);
});

const socketServer = new Server(httpServer);

//DB Connection
dbObjectConfig.connectDB();

//Real Time Products
const productsSocket = require('./utils/products.socket.js');
productsSocket(socketServer);

//Handlebars
const handlebars = require('express-handlebars');
app.engine('handlebars', handlebars.engine()); //Inicializo el engine de handlebars
app.set('views', __dirname + '/views'); //Le digo a mi app donde están mis vistas
app.set('view engine', 'handlebars'); //Le digo a mi app que lo use

//Routers
const appRouter = require('./routes/index.router');
app.use(appRouter);

//Manejo de ERRORES
app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send('Se produjo un error inesperado');
});
