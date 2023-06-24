const { productModel } = require('./models/product.model')

class ProductManagerMongo {
  get = async (sortOptions) => {
    try {
      return await productModel.paginate({}, sortOptions)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  getById = async (id) => {
    try {
      return await productModel.findOne({ _id: id })
    } catch (error) {
      throw new Error(error.message)
    }
  }

  getByCustomFilter = async (customFilter) => {
    try {
      return await productModel.find(customFilter)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  getByCode = async (code) => {
    try {
      return await productModel.findOne({ code: code })
    } catch (error) {
      throw new Error(error.message)
    }
  }

  create = async (product) => {
    try {
      return await productModel.create(product)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  update = async (id, product) => {
    try {
      return await productModel.findOneAndUpdate({ _id: id }, product)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  delete = async (id) => {
    try {
      return await productModel.findOneAndDelete({ _id: id })
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

module.exports = ProductManagerMongo
