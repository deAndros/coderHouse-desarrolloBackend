const ProductManager = require('../daos/fs/ProductManager.class')
const productManager = new ProductManager('./src/files/storedProducts.json')

const productsSocket = async (io) => {
  const products = await productManager.getProducts()

  io.on('connection', (socket) => {
    console.log('Products socket conectado')

    socket.emit('products', products)
  })
}

module.exports = productsSocket
