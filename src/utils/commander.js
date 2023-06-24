const { Command } = require('commander')

const commander = new Command()

commander.option('--mode <mode>', 'Modo de trabajo', 'development').parse()

process.on('exit', (code) => {
  console.log('se ejecuta justo antes de terminar el processo', code)
})
/*process.on('uncaughtException', (exception) => {
  console.log('se ejecuta justo con alguna excepción', exception)
})*/
process.on('message', (message) => {
  console.log('muestra el mensaje de otro processo', message)
})

module.exports = commander
