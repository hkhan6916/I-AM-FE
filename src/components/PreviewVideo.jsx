import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Dimensions,
} from 'react-native';
import { Video } from 'expo-av';
import themeStyle from '../theme.style';

const PreviewVideo = ({
  uri, headers, isFullWidth, removeBorder,
}) => {
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
            width: isFullWidth ? screenWidth : screenWidth / 1.5,
            height: isFullWidth ? screenWidth : (screenWidth * 1.33) / 1.5,
            borderWidth: removeBorder ? 0 : 2,
            borderColor: themeStyle.colors.primary.default,
            borderRadius: isFullWidth ? 0 : 10,
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
              width: isFullWidth ? screenWidth : screenWidth / 1.5,
              height: isFullWidth ? screenWidth : (screenWidth * 1.33) / 1.5,
              borderWidth: removeBorder ? 0 : 2,
              borderColor: themeStyle.colors.primary.default,
              borderRadius: isFullWidth ? 0 : 10,
              backgroundColor: themeStyle.colors.grayscale.black,
              opacity: 0.5,
            }}
            >
              <Text style={{
                flex: 1,
                position: 'absolute',
                fontSize: 20,
                textAlign: 'center',
                width: screenWidth / 1.5,
                color: themeStyle.colors.grayscale.white,
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
