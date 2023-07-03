const { productModel } = require('./models/product.model')

class ProductsDaoMongo {
  get = async (sortOptions) => {
    return await productModel.paginate({}, { ...sortOptions, lean: true })
  }

  getById = async (id) => {
    return await productModel.findOne({ _id: id })
  }

  getByCustomFilter = async (customFilter) => {
    console.log('ENTRÉ AL CUSTOM FILTER DEL DAO')
    return await productModel.find(customFilter)
  }

  getByCode = async (code) => {
    return await productModel.findOne({ code: code })
  }

  create = async (product) => {
    return await productModel.create(product)
  }

  update = async (id, product) => {
    return await productModel.findOneAndUpdate({ _id: id }, product)
  }

  delete = async (id) => {
    return await productModel.findOneAndDelete({ _id: id })
  }
}

module.exports = ProductsDaoMongo
