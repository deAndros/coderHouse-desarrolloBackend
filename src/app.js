//Express
const express = require("express");
const app = express();
const PORT = 8080;

//Socket IO
const { Server } = require("socket.io");

const httpServer = app.listen(PORT, () => {
  console.log(`Escuchando en el puerto ${PORT}`);
});

const socketServer = new Server(httpServer);

//Real Time Products
const productsSocket = require("./utils/products.socket.js");
productsSocket(socketServer);

//Middlewares Nativos de Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/static", express.static(__dirname + "/public"));

//Middlewares de Terceros
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//Handlebars
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine()); //Inicializo el engine de handlebars
app.set("views", __dirname + "/views"); //Le digo a mi app donde están mis vistas
app.set("view engine", "handlebars"); //Le digo a mi app que lo use

//Routers
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");

app.use("/", viewsRouter);

//_________________Apartado de PRODUCTOS_________________
app.use("/api/products", productsRouter);

//_________________Apartado de CARRITOS_________________
//TODO: Exponer las rutas para los endpoints que faltan
app.use("/api/carts", cartsRouter);

//Manejo de ERRORES
app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).send("Se produjo un error inesperado");
});
