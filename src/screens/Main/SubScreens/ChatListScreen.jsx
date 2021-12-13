import React, { useEffect, useState } from 'react';
import {
  ScrollView, Text, View, StyleSheet, Button,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiCall from '../../../helpers/apiCall';
import ChatCard from '../../../components/ChatCard';

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState(false);

  const navigation = useNavigation();

  const getUserChats = async () => {
    setError(false);
    const { response, success } = await apiCall('GET', '/user/chats/0');
    if (success) {
      setChats(response);
    } else {
      setError(true);
    }
  };
  useEffect(() => {
    (async () => {
      await getUserChats();
    })();
  }, []);
  return (
    <View style={styles.container}>
      <Button title="New chat" onPress={() => navigation.navigate('CreateChatScreen')} />
      {!error
        ? (
          <ScrollView>
            {chats.length ? chats.map((chat) => (
              <View key={chat._id}>
                {chat.users.length
                  ? (
                    <ChatCard
                      chat={chat}
                    />
                  )
                  : null}
              </View>
            )) : null}
          </ScrollView>
        )
        : (
          <View>
            <Text>Oops, something went wrong</Text>
          </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatListScreen;
