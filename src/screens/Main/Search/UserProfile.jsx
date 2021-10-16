import React from 'react';
import { View, Text } from 'react-native';
import { Video } from 'expo-av';

const UserProfileScreen = (props) => {
  const { user } = props.route.params;

  return (
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
  );
};

export default UserProfileScreen;
