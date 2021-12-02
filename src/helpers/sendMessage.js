/**
 * Sends a message within a chat. Only sending, not listening :).
 * Can send a string message, upload files and send url for them or both
 */
const sendMessage = async ({
  socket, body, chatId, senderId,
}) => {
  //   if (file) {
  //     // new FormData. send with apiCall. Get url and send to user.
  //   }

  socket.emit('sendMessage', { body, chatId, senderId });
};

export default sendMessage;
