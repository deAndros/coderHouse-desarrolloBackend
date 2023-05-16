const { connect } = require('mongoose');

const dbUrl =
  'mongodb+srv://andramos:VxZcHcbWw18AW3A5@coderhouse-desarrolloba.x33ap7o.mongodb.net/e_commerce?retryWrites=true&w=majority';

module.exports = {
  connectDB: () => {
    connect(dbUrl);
    console.log('Base de datos conectada');
  },
};
