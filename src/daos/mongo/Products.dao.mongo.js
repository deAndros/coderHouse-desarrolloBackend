const { productModel } = require('./models/product.model')

class ProductsDaoMongo {
  get = async (sortOptions) => {
    return await productModel.paginate({}, { ...sortOptions, lean: true })
  }

  getById = async (id) => {
    return await productModel.findOne({ _id: id })
  }

  getByCustomFilter = async (customFilter) => {
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

  customUpdate = async (filter, operation) => {
    return await productModel.findOneAndUpdate(filter, operation)
  }

  delete = async (id) => {
    return await productModel.findOneAndDelete({ _id: id })
  }

  deleteByCustomFilter = async (customFilter) => {
    return await productModel.findOneAndDelete(customFilter, { new: true })
  }
}

module.exports = ProductsDaoMongo
