import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button } from 'react-native';
import { Video } from 'expo-av';
import { useSelector, useDispatch } from 'react-redux';

import apiCall from '../../../helpers/apiCall';
import VideoPlayer from '../../../components/VideoPlayer';

const UserProfileScreen = (props) => {
  const { userId } = props.route.params;
  const [user, setUser] = useState({});
  const [profileVideoPlaying, setProfileVideoPlaying] = useState(false);

  const profileVideoRef = useRef(null);

  const dispatch = useDispatch();
  const userData = useSelector((state) => state.userData);

  const sendFriendRequest = async () => {
    const updatedUserData = userData.state;

    updatedUserData.friendRequestsSent.push(userId);

    dispatch({ type: 'SET_USER_DATA', payload: updatedUserData });
    const {
      success, error, response,
    } = await apiCall('GET', `/user/friend/request/send/${userId}`);
    if (success && response !== userData.state) {
      dispatch({ type: 'SET_USER_DATA', payload: response });
    }
    if (!success || error === 'CONNECTION_FAILED') {
      const index = updatedUserData.friendRequestsSent.indexOf(userId);
      if (index !== -1) {
        updatedUserData.friendRequestsSent.splice(index, 1);
      }
      dispatch({ type: 'SET_USER_DATA', payload: updatedUserData });
    }
  };

  const recallFriendRequest = async () => {
    const updatedUserData = userData.state;
    const index = updatedUserData.friendRequestsSent.indexOf(userId);
    if (index !== -1) {
      updatedUserData.friendRequestsSent.splice(index, 1);
    }

    dispatch({ type: 'SET_USER_DATA', payload: updatedUserData });

    const { success, response, error } = await apiCall('GET', `/user/friend/request/recall/${userId}`);
    if (success && response !== userData.state) {
      dispatch({ type: 'SET_USER_DATA', payload: response });
    }
    if (!success || error === 'CONNECTION_FAILED') {
      updatedUserData.friendRequestsSent.push(userId);

      dispatch({ type: 'SET_USER_DATA', payload: updatedUserData });
    }
  };

  const acceptFriendRequest = async () => {
    const updatedUserData = userData.state;
    const requestReceivedIndex = updatedUserData.friendRequestsReceived.indexOf(userId);
    if (requestReceivedIndex !== -1) {
      updatedUserData.friendRequestsReceived.splice(requestReceivedIndex, 1);
    }

    updatedUserData.connections.push(userId);

    dispatch({ type: 'SET_USER_DATA', payload: updatedUserData });

    const {
      success, error, response,
    } = await apiCall('GET', `/user/friend/request/accept/${userId}`);

    if (success && response !== userData.state) {
      dispatch({ type: 'SET_USER_DATA', payload: response });
    }

    if (!success || error === 'CONNECTION_FAILED') {
      const connectionIndex = updatedUserData.connections.indexOf(userId);
      if (connectionIndex !== -1) {
        updatedUserData.connections.splice(connectionIndex, 1);
      }

      updatedUserData.friendRequestsReceived.push(userId);

      dispatch({ type: 'SET_USER_DATA', payload: updatedUserData });
    }
  };

  const removeConnection = async () => {
    const { success, response } = await apiCall('GET', `/user/friend/remove/${userId}`);
    if (success) {
      dispatch({ type: 'SET_USER_DATA', payload: response });
    }
  };
  useEffect(() => {
    (async () => {
      const { success, response } = await apiCall('GET', `/user/${userId}`);
      if (success) {
        setUser(response.otherUser);
        dispatch({ type: 'SET_USER_DATA', payload: response.user });
      }
    })();
    return () => {
      setUser({});
    };
  }, []);

  if (user) {
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
          title={userData.state?.connections.includes(userId)
            ? 'Remove From Friends'
            : userData.state?.friendRequestsReceived.includes(userId)
              ? 'Accept Request'
              : userData.state?.friendRequestsSent.includes(userId)
                ? 'Request sent'
                : 'Add user'}
          onPress={() => (userData.state?.connections.includes(userId)
            ? removeConnection()
            : userData.state?.friendRequestsReceived.includes(userId)
              ? acceptFriendRequest()
              : userData.state?.friendRequestsSent.includes(userId)
                ? recallFriendRequest()
                : sendFriendRequest())}
        />
      </View>
    );
  } return <View />;
};

export default UserProfileScreen;
