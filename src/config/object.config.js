const { connect } = require('mongoose')
const dotenv = require('dotenv')
const commander = require('../utils/commander')
const { mode } = commander.opts()

dotenv.config({
  path: mode === 'development' ? './.env.development' : './.env.production',
})

const dbUrl = process.env.MONGO_URL_TST
//TODO: Pasar el resto de los parámetros seteados en mi .env a los demás archivos que los utilizan. Ahora solo estoy pasando el puerto.
module.exports = {
  PORT: process.env.PORT,
  connectDB: () => {
    connect(dbUrl)
    console.log('Base de datos conectada')
  },
}
