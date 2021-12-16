import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions,
} from 'react-native';
import { Video } from 'expo-av';
import ImageWithCache from './ImageWithCache';
import themeStyle from '../theme.style';

const MessageBox = ({
  belongsToSender, message, setMediaUrlPlaying, mediaUrlPlaying,
}) => {
  const {
    body, mediaUrl, mediaHeaders, stringTime, mediaType,
  } = message;
  const video = useRef(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // const handleVideoStatusChange = (status) => {
  //   setVideoPlaying(true);
  //   if (mediaUrlPlaying !== mediaUrl) {
  //     setMediaUrlPlaying(mediaUrl);
  //   }
  // };

  // useEffect(() => {
  //   (async () => {
  //     if (mediaUrlPlaying !== mediaUrl) {
  //       setVideoPlaying(false);
  //       await video.current?.pauseAsync();
  //     }
  //   })();
  // }, [mediaUrlPlaying]);

  const { width: screenWidth } = Dimensions.get('window');
  return (
    <View style={styles.container}>
      <View style={[styles.subContainer, { alignItems: belongsToSender ? 'flex-end' : 'flex-start' }]}>
        <View style={styles.message}>
          <Text style={{
            fontSize: 12, fontWeight: '700', textAlign: 'right', color: 'white',
          }}
          >
            {stringTime}
          </Text>
          {mediaUrl && mediaType === 'image' ? (
            <ImageWithCache
              resizeMode="cover"
              mediaUrl={mediaUrl}
              mediaHeaders={mediaHeaders}
              aspectRatio={1 / 1}
            />
          ) : mediaUrl && mediaType === 'video' ? (
            <Video
              // onPlaybackStatusUpdate={(status) => handleVideoStatusChange(status)}
              onsta
              ref={video}
              style={{ resizeMode: 1, height: screenWidth / 1.5, width: screenWidth / 1.5 }}
              source={{
                uri: mediaUrl,
                headers: mediaHeaders,
              }}
              isLooping
              useNativeControls
              resizeMode="cover"
            />
          ) : null}
          {body ? (
            <Text style={{ color: themeStyle.colors.grayscale.white }}>
              {body}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginLeft: 10,
  },
  senderName: {
    color: themeStyle.colors.grayscale.white,
    fontWeight: '700',
    marginRight: 10,
  },
  message: {
    backgroundColor: themeStyle.colors.primary.default,
    borderRadius: 10,
    padding: 5,
    marginLeft: 50,
  },
  subContainer: {
    marginHorizontal: 10,
    flex: 1,
  },
});

export default MessageBox;
