//TODO: En esta entrega se decidió no utilizar Factory porque tengo que desarrollar los DAO de Files y Memory para que se adapten al resto de la aplicación

const config = require('../config/object.config')
let UsersDao
let ProductsDao
let CartsDao
let ContactsDao

switch (config.persistance) {
  case 'MONGO':
    config.connectDB()
    const ProductsDaoMongo = require('../daos/mongo/Products.dao.mongo.js')
    //const UsersDaoMongo = require('../daos/mongo/users.dao.mongo.js')
    const CartsDaoMongo = require('../daos/mongo/Carts.dao.mongo.js')
    //const ContactsDaoMongo = require('../daos/mongo/contacts.dao.mongo.js')

    //UsersDao = UsersDaoMongo
    ProductsDao = ProductsDaoMongo
    CartsDao = CartsDaoMongo
    //ContactsDao = ContactsDaoMongo
    break
  case 'FILE':
    //TODO: Implementar DAOS de FS
    break
  case 'MEMORY':
    //TODO: Implementar DAOS de MEMORY
    break

  default:
    break
}

module.exports = {
  //UsersDao,
  ProductsDao,
  CartsDao,
  //ContactsDao,
}
