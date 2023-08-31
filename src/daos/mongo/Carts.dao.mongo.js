const cartModel = require('./models/cart.model')

class CartsDaoMongo {
  get = async () => {
    return await cartModel.paginate(
      {},
      { populate: 'products.product', lean: true, new: true, limit: 1000 }
    )
    //TODO: El limit está hardcodeado, buscar la manera de recibirlo dinámicamente en sortOptions
  }

  getById = async (cid) => {
    return await cartModel
      .findOne({ _id: cid })
      .populate('products.product')
      .lean()
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
