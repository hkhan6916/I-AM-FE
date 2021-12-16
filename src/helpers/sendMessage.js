const sendMessage = async ({
  socket, body, chatId, senderId, mediaUrl, mediaType,
}) => {
  socket.emit('sendMessage', {
    body, chatId, senderId, mediaUrl, mediaType,
  });
};

export default sendMessage;
