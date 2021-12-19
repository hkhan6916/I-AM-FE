const sendMessage = async ({
  socket, body, chatId, senderId, mediaUrl, mediaType, mediaHeaders,
}) => {
  socket.emit('sendMessage', {
    body, chatId, senderId, mediaUrl, mediaType, mediaHeaders,
  });
};

export default sendMessage;
