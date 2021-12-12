import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import apiCall from '../../../helpers/apiCall';

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const getUserChats = async () => {
    const { response, success } = await apiCall('GET', 'user/chats/0');
  };
  useEffect(() => {
    (async () => {
      await getUserChats();
    })();
  }, []);
  return (
    <View />
  );
};

export default ChatListScreen;
