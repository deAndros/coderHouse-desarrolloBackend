//PARA REDIRECCIONAR EN UNA RESPUESTA:  res.send y luego abajo res.redirect('/ruta')

/*Github Authentication DATA: 
SECRET: a4dbfe46251d89f005187b2c4c08b3adb35f91f1
App ID: 337421
Client ID: Iv1.be67aebe5cf30c15*/

//DB Config
const dbObjectConfig = require('./config/dbObject.config');

//Passport
const { initPassport, initPassportGithub } = require('./config/passportConfig');
const passport = require('passport');

//Express
const express = require('express');
const app = express();
const PORT = 8080;

//Middlewares Nativos de Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/static', express.static(__dirname + '/public')); //static es una carpeta virtual, creada por el middleware. Podría ponerle otro nombre si quisiera.

//Middlewares de Terceros
const session = require('express-session');
const { create } = require('connect-mongo');

app.use(
  session({
    store: create({
      mongoUrl:
        'mongodb+srv://andramos:VxZcHcbWw18AW3A5@coderhouse-desarrolloba.x33ap7o.mongodb.net/e_commerce?retryWrites=true&w=majority',
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
      ttl: 10000,
    }),
    secret: 'S3c123t',
    resave: false, //Permite tener una sesión activa
    saveUninitialized: false, //Permite guardar cualquier sesión
  })
);

const cookieParser = require('cookie-parser');
app.use(cookieParser('S3c123t'));

const logger = require('morgan');
app.use(logger('dev'));

//Sessions

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

//Uso de Passport
initPassport();
initPassportGithub();
passport.use(passport.initialize());
passport.use(passport.session());

//Routers
const appRouter = require('./routes/index.router');
app.use(appRouter);

//Manejo de ERRORES
app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send('Se produjo un error inesperado');
});
