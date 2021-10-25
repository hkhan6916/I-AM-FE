import React from 'react';
import { View, Text, Button } from 'react-native';

import { Video } from 'expo-av';
import { useSelector, useDispatch } from 'react-redux';
import apiCall from '../../../helpers/apiCall';

const UserProfileScreen = (props) => {
  const user = props?.route?.params?.user;

  const dispatch = useDispatch();
  const userData = useSelector((state) => state.userData);

  const sendFriendRequest = async () => {
    const { success, response } = await apiCall('GET', `/user/friend/request/send/${user?._id}`);
    if (success) {
      dispatch({ type: 'SET_USER_DATA', payload: response });
    }
  };

  const recallFriendRequest = async () => {
    const { success, response } = await apiCall('GET', `/user/friend/request/recall/${user?._id}`);
    if (success) {
      dispatch({ type: 'SET_USER_DATA', payload: response });
    }
  };

  const removeConnection = async () => {
    const { success, response } = await apiCall('GET', `/user/friend/remove/${user?._id}`);
    if (success) {
      dispatch({ type: 'SET_USER_DATA', payload: response });
    }
  };

  if (user) {
    return (
      <View>
        <Video
          style={{
            transform: [
              { scaleX: -1 },
            ],
            alignSelf: 'center',
            width: 400,
            height: 300,
            borderWidth: 2,
            borderColor: '#138294',
            borderRadius: 10,
          }}
          useNativeControls
          source={{
            uri: user.profileVideoUrl,
          }}
          isLooping
          resizeMode="cover"
        />
        <Text>TODO add job title search here.</Text>
        <Button
          title={userData.state?.connections.includes(user._id)
            ? 'Remove From Friends'
            : userData.state?.friendRequestsSent.includes(user._id)
              ? 'Request sent' : 'Add user'}
          onPress={() => (userData.state?.connections.includes(user._id)
            ? removeConnection() : userData.state?.friendRequestsSent.includes(user._id)
              ? recallFriendRequest() : sendFriendRequest())}
        />
      </View>
    );
  } return <View />;
};

export default UserProfileScreen;
