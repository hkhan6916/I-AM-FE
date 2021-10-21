import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Video } from 'expo-av';

const UserProfileScreen = (props) => {
  const { user } = props.route.params;
  const navigation = useNavigation();
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
      <Button title="test" onPress={() => navigation.navigate('Home')} />
    </View>
  );
};

export default UserProfileScreen;
