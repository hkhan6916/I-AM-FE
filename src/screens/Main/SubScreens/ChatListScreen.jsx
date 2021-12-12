import React, { useEffect, useState } from 'react';
import {
  ScrollView, Text, View, StyleSheet, Button,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiCall from '../../../helpers/apiCall';

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
            {chats.map((chat) => (
              <View key={chat._id}>
                <Text>
                  {chat.secondUser.firstName}
                  {' '}
                  {chat.secondUser.lastName}
                </Text>
              </View>
            ))}
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
