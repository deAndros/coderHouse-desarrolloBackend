const cartModel = require('./models/cart.model')

class CartManagerMongo {
  get = async () => {
    try {
      return await cartModel.find({}).populate('products.product')
    } catch (error) {
      throw new Error(error.message)
    }
  }

  getById = async (cid) => {
    try {
      return await cartModel.findOne({ _id: cid })
    } catch (error) {
      throw new Error(error.message)
    }
  }

  update = async (filter, operation, upsert = false) => {
    //TODO: Buscar maneras de hacer esta función aún más genérica
    try {
      return await cartModel.findOneAndUpdate(
        filter,
        operation,
        { new: true },
        { upsert: upsert }
      )
    } catch (error) {
      throw new Error()
    }
  }

  create = async (products = []) => {
    try {
      return await cartModel.create({ products: products })
    } catch (error) {
      throw new Error(error.message)
    }
  }

  //TODO: Falta probarlo y exponerlo
  delete = async (cid) => {
    try {
      return await cartModel.findOneAndDelete({ _id: cid })
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

module.exports = CartManagerMongo
