const cartModel = require('./models/cart.model')

class CartsDaoMongo {
  get = async () => {
    return await cartModel.find({}).populate('products.product')
  }

  getById = async (cid) => {
    return await cartModel.findOne({ _id: cid })
  }

  update = async (filter, operation, upsert = false) => {
    //TODO: Buscar maneras de hacer esta función aún más genérica

    return await cartModel.findOneAndUpdate(
      filter,
      operation,
      { new: true },
      { upsert: upsert }
    )
  }

  create = async (products = []) => {
    return await cartModel.create({ products: products })
  }

  //TODO: Falta probarlo y exponerlo
  delete = async (cid) => {
    return await cartModel.findOneAndDelete({ _id: cid })
  }
}

module.exports = CartsDaoMongo
