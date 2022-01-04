import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import apiCall from '../../../helpers/apiCall';
import VideoPlayer from '../../../components/VideoPlayer';

const UserProfileScreen = (props) => {
  const { userId } = props.route.params;
  const [user, setUser] = useState({});

  const dispatch = useDispatch();
  const userData = useSelector((state) => state.userData);
  const sendFriendRequest = async () => {
    // const updatedUserData = userData.state;

    // updatedUserData.friendRequestsSent.push(userId);

    // dispatch({ type: 'SET_USER_DATA', payload: updatedUserData });
    // const {
    //   success, error, response,
    // } = await apiCall('GET', `/user/friend/request/send/${userId}`);
    // if (success && response !== userData.state) {
    //   dispatch({ type: 'SET_USER_DATA', payload: response });
    // }
    // if (!success || error === 'CONNECTION_FAILED') {
    //   const index = updatedUserData.friendRequestsSent.indexOf(userId);
    //   if (index !== -1) {
    //     updatedUserData.friendRequestsSent.splice(index, 1);
    //   }
    //   dispatch({ type: 'SET_USER_DATA', payload: updatedUserData });
    // }

    const userRequestSent = { ...user, requestSent: true };

    setUser(userRequestSent);

    const {
      success, error, response, message,
    } = await apiCall('GET', `/user/friend/request/send/${userId}`);
    console.log(message);
    // if (success && response !== userData.state) {
    //   dispatch({ type: 'SET_USER_DATA', payload: response });
    // }
    if (!success || error === 'CONNECTION_FAILED') {
      const userRequestRemoved = { ...user, requestSent: false };
      setUser(userRequestRemoved);
    }
  };

  const recallFriendRequest = async () => {
    // const updatedUserData = userData.state;
    // const index = updatedUserData.friendRequestsSent.indexOf(userId);
    // if (index !== -1) {
    //   updatedUserData.friendRequestsSent.splice(index, 1);
    // }

    // dispatch({ type: 'SET_USER_DATA', payload: updatedUserData });

    // const { success, response, error } = await apiCall('GET', `/user/friend/request/recall/${userId}`);
    // if (success && response !== userData.state) {
    //   dispatch({ type: 'SET_USER_DATA', payload: response });
    // }
    // if (!success || error === 'CONNECTION_FAILED') {
    //   updatedUserData.friendRequestsSent.push(userId);

    //   dispatch({ type: 'SET_USER_DATA', payload: updatedUserData });
    // }

    const userRequestSent = { ...user, requestSent: false };

    setUser(userRequestSent);
    const {
      success, error, message,
    } = await apiCall('GET', `/user/friend/request/recall/${userId}`);
    console.log(message);
    if (!success || error === 'CONNECTION_FAILED') {
      const userRequestRemoved = { ...user, requestSent: true };
      setUser(userRequestRemoved);
    }
  };

  const acceptFriendRequest = async () => {
    // const updatedUserData = userData.state;
    // const requestReceivedIndex = updatedUserData.friendRequestsReceived.indexOf(userId);
    // if (requestReceivedIndex !== -1) {
    //   updatedUserData.friendRequestsReceived.splice(requestReceivedIndex, 1);
    // }

    // updatedUserData.connections.push(userId);

    // dispatch({ type: 'SET_USER_DATA', payload: updatedUserData });

    // const {
    //   success, error, response,
    // } = await apiCall('GET', `/user/friend/request/accept/${userId}`);

    // if (success && response !== userData.state) {
    //   dispatch({ type: 'SET_USER_DATA', payload: response });
    // }

    // if (!success || error === 'CONNECTION_FAILED') {
    //   const connectionIndex = updatedUserData.connections.indexOf(userId);
    //   if (connectionIndex !== -1) {
    //     updatedUserData.connections.splice(connectionIndex, 1);
    //   }

    //   updatedUserData.friendRequestsReceived.push(userId);

    //   dispatch({ type: 'SET_USER_DATA', payload: updatedUserData });
    // }

    const userIsFriend = { ...user, isFriend: true };

    setUser(userIsFriend);

    const {
      success, error,
    } = await apiCall('GET', `/user/friend/request/accept/${userId}`);

    if (!success || error === 'CONNECTION_FAILED') {
      const userIsNotFriend = { ...user, isFriend: false };

      setUser(userIsNotFriend);
    }
  };

  const removeConnection = async () => {
    // const { success, response } = await apiCall('GET', `/user/friend/remove/${userId}`);
    // if (success) {
    //   dispatch({ type: 'SET_USER_DATA', payload: response });
    // }

    const userIsNotFriend = { ...user, isFriend: false, requestReceived: false };

    setUser(userIsNotFriend);

    const { success, error } = await apiCall('GET', `/user/friend/remove/${userId}`);

    if (!success || error === 'CONNECTION_FAILED') {
      const userIsFriend = { ...user, isFriend: true, requestReceived: false };

      setUser(userIsFriend);
    }
  };
  useEffect(() => {
    (async () => {
      const { success, response } = await apiCall('GET', `/user/${userId}`);
      if (success) {
        setUser(response.otherUser);
        // dispatch({ type: 'SET_USER_DATA', payload: response.user });
      }
    })();
    return () => {
      setUser({});
    };
  }, []);

  if (user && user._id) {
    return (
      <View style={{ height: 400 }}>
        <VideoPlayer
          url={user.profileVideoUrl}
          mediaHeaders={user.profileVideoHeaders}
          mediaIsSelfie
        />
        <Text>
          {user.firstName}
          {' '}
          {user.lastName}
        </Text>
        <Button
          title={user.isFriend
            ? 'Remove From Friends'
            : user.requestReceived
              ? 'Accept Request'
              : user.requestSent
                ? 'Request sent'
                : 'Add user'}
          onPress={() => (user.isFriend
            ? removeConnection()
            : user.requestReceived
              ? acceptFriendRequest()
              : user.requestSent
                ? recallFriendRequest()
                : sendFriendRequest())}
        />
      </View>
    );
  } return <View />;
};

export default UserProfileScreen;
