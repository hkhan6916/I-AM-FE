import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  ScrollView, Text, View, StyleSheet, Button,
} from 'react-native';
import apiCall from '../../../helpers/apiCall';

const CreateChatScreen = () => {
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState('');

  const navigation = useNavigation();

  const getUserFriends = async () => {
    const { success, response } = await apiCall('GET', `/user/friend/fetch/all/offset/${friends.length}`);
    if (success) {
      setFriends(response);
    } else {
      setError(true);
    }
  };

  const createChat = async () => {
    setError(false);
    const { response, success } = await apiCall('POST', '/chat/new', [selectedParticipant]);
    if (success) {
      navigation.navigate('ChatScreen', { chatId: response._id });
    } else {
      setError(true);
    }
  };

  useEffect(() => {
    (async () => {
      await getUserFriends();
    })();
  }, []);
  return (
    <View style={styles.container}>
      <Button title="New chat" onPress={() => createChat()} />
      {!error
        ? (
          <ScrollView>
            {friends.map((friend) => (
              <View key={friend._id}>
                <Text>
                  {friend.firstName}
                  {' '}
                  {friend.lastName}
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

export default CreateChatScreen;
