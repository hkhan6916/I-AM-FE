const sendMessage = async ({
  socket, body, chatId, senderId, mediaUrl,
}) => {
  socket.emit('sendMessage', {
    body, chatId, senderId, mediaUrl,
  });
};

export default sendMessage;
