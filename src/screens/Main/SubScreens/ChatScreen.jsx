import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, TextInput, ScrollView, SafeAreaView,
} from 'react-native';
import { getItemAsync } from 'expo-secure-store';
import { io } from 'socket.io-client';
import sendMessage from '../../../helpers/sendMessage';

const ChatScreen = ({
  // chatId
}) => {
  const [authInfo, setAuthInfo] = useState(null);
  const [socket, setSocket] = useState(null);

  const [messageBody, setMessageBody] = useState('');
  const [messages, setMessages] = useState([]);
  const [showError, setShowError] = useState(false);

  const initSocket = async () => {
    const token = await getItemAsync('authToken');
    const senderId = await getItemAsync('userId');

    setAuthInfo({ token, senderId });

    const connection = io.connect('http://192.168.5.101:5000', {
      auth: {
        token,
      },
    });

    setSocket(connection);
  };

  const handleMessageSend = async () => {
    await sendMessage({
      socket, body: messageBody, chatId: '61a674407512ac67ec03d931', senderId: authInfo.senderId,
    });
    if (socket.connected) {
      setMessages([...messages, { body: messageBody, chatId: '61a674407512ac67ec03d931', senderId: authInfo.senderId }]);
      setMessageBody('');
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      (async () => {
        await initSocket();
      })();
    }
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (socket && isMounted) {
      socket.emit('joinRoom', { chatId: '61a674407512ac67ec03d931' });
      socket.on('receiveMessage', ({ body, chatId, senderId }) => {
        if (!socket.connected) {
          setShowError(true);
        } else {
          setMessages((prevMessages) => [...prevMessages, { body, chatId, senderId }]);
        }
      });
    }
    return () => {
      isMounted = false;
      if (socket) {
        socket.off('receiveMessage');
      }
    };
  }, [socket]);

  return (
    <SafeAreaView>
      <Text>Chat Screen</Text>
      <TextInput value={messageBody} placeholder="Type a message..." onChangeText={(v) => setMessageBody(v)} />
      <Button
        title="send"
        onPress={() => handleMessageSend()}
      />
      {showError
        ? (
          <Text>
            We tried to think of a fun message for this but failed. We&apos;ll
            say it how it is. &quot;An unexpected error occured. Check your connection.&quot;
          </Text>
        )
        : null}
      <ScrollView>
        {messages.length ? messages.map((message, i) => (
          <Text key={`message${i}`}>{message.body}</Text>
        )) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChatScreen;
