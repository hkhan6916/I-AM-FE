import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, Button, RefreshControl, ScrollView,
} from 'react-native';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import apiCall from '../../../helpers/apiCall';
import UserThumbnail from '../../../components/UserThumbnail';

const FriendsScreen = () => {
  const [friends, setFriends] = useState([]);
  const navigation = useNavigation();
  const [offset, setOffset] = useState();
  const [refreshing, setRefreshing] = useState(false);

  const getFriends = async () => {
    const { success, response } = await apiCall('GET', '/user/friend/fetch/all');
    if (success) {
      setFriends(response);
    }
  };

  const onRefresh = React.useCallback(async () => {
    await getFriends();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    (async () => {
      await getFriends();
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Friend Requests" onPress={() => navigation.navigate('FriendRequestsScreen')} />
      <ScrollView refreshControl={(
        <RefreshControl
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
        )}
      >
        {friends.length ? friends.map((friend) => (
          <UserThumbnail key={friend._id} user={friend} avatarSize={50} />
        )) : <View />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
});

export default FriendsScreen;
