const { Schema, model } = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

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
  age: { type: Number },
  cart: {
    type: Schema.Types.ObjectId,
    ref: 'carts',
  },
  password: { type: String, required: true },
  role: { type: String, default: 'User' },
  documents: [
    {
      name: String,
      reference: String,
    },
  ],
  last_connection: { type: Date, default: Date.now() },
})

userSchema.plugin(mongoosePaginate)
const userModel = model(collection, userSchema)

module.exports = {
  userModel,
}
