const { userModel } = require('./models/user.model')

class UsersDaoMongo {
  get = async (sortOptions) => {
    return await userModel.paginate({}, { ...sortOptions, lean: true })
  }

  getById = async (id) => {
    return await userModel.findOne({ _id: id })
  }

  getByCustomFilter = async (customFilter) => {
    return await userModel.find(customFilter)
  }

  getByEmail = async (email) => {
    return await userModel.findOne({ email: email })
  }

  create = async (user) => {
    return await userModel.create(user)
  }

  update = async (id, user) => {
    return await userModel.findOneAndUpdate({ _id: id }, user)
  }

  delete = async (id) => {
    return await userModel.findOneAndDelete({ _id: id })
  }
}

module.exports = UsersDaoMongo
