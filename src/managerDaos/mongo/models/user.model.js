const { Schema, model } = require('mongoose');

const collection = 'users';

const userSchema = new Schema({
  user_name: { type: String, required: true, unique: true },
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
  password: { type: String, required: true },
  role: { type: String, default: 'Client' },
});

const userModel = model(collection, userSchema);

module.exports = {
  userModel,
};
