//Evaluar lo posibilidad de implementar esto en Mongo
let messages = []

const chatSocket = async (io) => {
  io.on('connection', (socket) => {
    console.log('Chat socket conectado')

    socket.on('message', (chatData) => {
      messages.push(chatData)
      io.emit('messagesLog', messages)
    })
  })
}

module.exports = chatSocket
