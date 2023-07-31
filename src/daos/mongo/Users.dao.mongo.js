const { userModel } = require('./models/user.model')

class UsersDaoMongo {
  get = async (sortOptions) => {
    return await userModel.paginate({}, { ...sortOptions, lean: true })
    //.populate('cart') TODO: Resolver por qué no funciona el populate
  }

  getById = async (id) => {
    return await userModel.findOne({ _id: id }).populate('cart')
  }

  getByCustomFilter = async (customFilter) => {
    return await userModel.find(customFilter).populate('cart')
  }

  getByEmail = async (email) => {
    return await userModel.findOne({ email: email }).populate('cart')
  }

  create = async (user) => {
    return await userModel.create(user)
  }

  update = async (id, user) => {
    return await userModel.findOneAndUpdate({ _id: id }, user, { new: true })
  }

  delete = async (id) => {
    return await userModel.findOneAndDelete({ _id: id })
  }
}

module.exports = UsersDaoMongo
