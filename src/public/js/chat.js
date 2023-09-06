const socket = io()
const chatBox = document.querySelector('.chat-box')
const sendButton = document.querySelector('.send-button')
const messageLogs = document.getElementById('messageLogs')
let nickname

Swal.fire({
  title: 'Identifícate',
  input: 'text',
  text: '¡Ingresa un nickname para tu chat!',
  inputValidator: (value) => {
    return !value && 'El nickname es obligatorio'
  },
  allowOutsideClick: false,
  allowEscapeKey: false,
}).then((result) => {
  nickname = result.value
  socket.emit('authenticated', nickname)
})

chatBox.addEventListener('keyup', (evt) => {
  if (evt.key === 'Enter') {
    if (chatBox.value.trim().length > 0) {
      socket.emit('message', {
        nickname,
        message: chatBox.value,
      })
      chatBox.value = ''
    }
  }
})

sendButton.addEventListener('click', (evt) => {
  if (chatBox.value.trim().length > 0) {
    socket.emit('message', {
      nickname,
      message: chatBox.value,
    })
    chatBox.value = ''
  }
})

socket.on('messagesLog', (chatsData) => {
  let messages = ''
  chatsData.forEach((chatData) => {
    messages += `<div class="message">
                    <span class="user-name">${chatData.nickname}:</span>
                    <span class="message-text">${chatData.message}</span>
                </div>`
  })
  messageLogs.innerHTML = messages
})
