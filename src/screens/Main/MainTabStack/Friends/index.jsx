import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FriendsScreen from './Friends';
import FriendRequestsScreen from './FriendRequests';
import apiCall from '../../../../helpers/apiCall';

const Stack = createNativeStackNavigator();

const FriendsStack = () => {
  const [friends, setFriends] = useState([]);
  const [friendRequestsReceived, setFriendRequestsReceived] = useState([]);
  const [friendRequestsSent, setFriendRequestsSent] = useState([]);

  const getFriends = async () => {
    const { success, response } = await apiCall('GET', '/user/friend/fetch/all');
    if (success) {
      setFriends(response);
    }
  };

  const getFriendRequests = async () => {
    const { success, response } = await apiCall('GET', '/user/friend/requests');
    if (success) {
      setFriendRequestsReceived(response.received);
      setFriendRequestsSent(response.sent);
    }
  };

  useEffect(() => {
    (async () => {
      await getFriends();
      await getFriendRequests();
    })();
  }, []);
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="FriendsScreen"
    >
      <Stack.Screen name="FriendsScreen">
        {(props) => (
          <FriendsScreen friends={friends} />
        )}
      </Stack.Screen>
      <Stack.Screen name="FriendRequestsScreen">
        {(props) => (
          <FriendRequestsScreen
            friendRequestsReceived={friendRequestsReceived}
            friendRequestsSent={friendRequestsSent}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
export default FriendsStack;
