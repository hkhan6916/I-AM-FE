import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  ScrollView, Text, View, StyleSheet, TouchableOpacity, FlatList,
} from 'react-native';
import apiCall from '../../../helpers/apiCall';
import UserThumbnail from '../../../components/UserThumbnail';

const CreateChatScreen = () => {
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState(false);

  const navigation = useNavigation();

  const getUserFriends = async () => {
    const { success, response } = await apiCall('GET', `/user/friend/fetch/all/${friends.length}`);
    if (success) {
      setFriends(response);
    } else {
      setError(true);
    }
  };

  const handleChatNavigation = async (chatUserId) => {
    setError(false);
    const { response, success } = await apiCall('POST', '/chat/exists', { participants: [chatUserId] });
    if (success) {
      if (response === null) {
        navigation.navigate('ChatScreen', { chatUserId });
      } else {
        navigation.navigate('ChatScreen', { existingChat: response });
      }
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
      {!error
        ? (
          // <ScrollView>
          //   {friends.map((friend) => (
          //     <TouchableOpacity
          //       key={friend._id}
          //       onPress={() => handleChatNavigation(friend._id)}
          //     >
          //       <UserThumbnail preventClicks user={friend} avatarSize={50} />
          //     </TouchableOpacity>
          //   ))}
          // </ScrollView>
          <FlatList
            data={friends}
            renderItem={({ item: friend }) => (
              <TouchableOpacity
                onPress={() => handleChatNavigation(friend._id)}
              >
                <UserThumbnail preventClicks user={friend} avatarSize={50} />
              </TouchableOpacity>
            )}
            onEndReached={() => getUserFriends()}
            onEndReachedThreshold={0.3}
            keyExtractor={(item) => item._id}
          />
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
