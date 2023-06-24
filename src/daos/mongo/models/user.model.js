const { Schema, model } = require('mongoose')

const collection = 'users'

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  age: { type: Number, required: true },
  cart: {
    type: Schema.Types.ObjectId,
    ref: 'carts',
  },
  password: { type: String, required: true },
  role: { type: String, default: 'User' },
})

const userModel = model(collection, userSchema)

module.exports = {
  userModel,
}
