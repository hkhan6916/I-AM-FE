import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Dimensions,
} from 'react-native';
import { Video } from 'expo-av';
import themeStyle from '../theme.style';

const PreviewVideo = ({ uri, headers }) => {
  const { width: screenWidth } = Dimensions.get('window');
  const [profileVideoPlaying, setProfileVideoPlaying] = useState(false);
  const profileVideoRef = useRef(null);
  return (
    <View>
      <TouchableOpacity
        style={{
          alignSelf: 'center',
        }}
        onPress={() => (profileVideoPlaying.isPlaying
          ? profileVideoRef.current.pauseAsync() : profileVideoRef.current.playAsync())}
      >
        <Video
          style={{
            transform: [
              { scaleX: -1 },
            ],
            alignSelf: 'center',
            width: screenWidth / 1.5,
            height: (screenWidth * 1.33) / 1.5,
            borderWidth: 2,
            borderColor: themeStyle.colors.primary.default,
            borderRadius: 10,
          }}
          onPlaybackStatusUpdate={(status) => setProfileVideoPlaying(() => status)}
          ref={profileVideoRef}
          source={{
            uri,
            headers,
          }}
          isLooping
          resizeMode="cover"
        />
        {!profileVideoPlaying.isPlaying
          ? (
            <View style={{
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
              width: screenWidth / 1.5,
              height: (screenWidth * 1.33) / 1.5,
              borderWidth: 2,
              borderColor: themeStyle.colors.primary.default,
              borderRadius: 10,
              backgroundColor: '#000',
              opacity: 0.5,
            }}
            >
              <Text style={{
                flex: 1,
                position: 'absolute',
                fontSize: 20,
                textAlign: 'center',
                width: screenWidth / 1.5,
                color: '#fff',
              }}
              >
                Tap to preview
              </Text>
            </View>
          )
          : null}
      </TouchableOpacity>
    </View>
  );
};

export default PreviewVideo;
