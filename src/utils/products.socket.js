const ProductManager = require('../managerDaos/fs/ProductManager.class');
const productManager = new ProductManager('./src/files/storedProducts.json');

const productsSocket = async (io) => {
  const products = await productManager.getProducts();

  io.on('connection', (socket) => {
    console.log('Cliente conectado en Real Time Products');

    socket.emit('products', products);
  });
};

module.exports = productsSocket;
