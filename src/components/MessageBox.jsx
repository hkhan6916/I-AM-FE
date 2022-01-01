import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { Video } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ImageWithCache from './ImageWithCache';
import themeStyle from '../theme.style';

const MessageBox = ({
  belongsToSender, message,
}) => {
  const {
    body, mediaUrl, mediaHeaders, stringTime, mediaType,
  } = message;
  const [imageFullScreen, setImageFullScreen] = useState(false);

  const videoRef = useRef(null);

  return (
    <View style={styles.container}>
      <View style={[styles.subContainer, { alignItems: belongsToSender ? 'flex-end' : 'flex-start' }]}>
        <View style={[styles.message, belongsToSender ? { marginLeft: 50 } : { marginRight: 50 }]}>
          {mediaUrl && mediaType === 'image' ? (
            <TouchableOpacity onPress={() => setImageFullScreen(true)}>
              <ImageWithCache
                resizeMode="cover"
                mediaUrl={mediaUrl}
                mediaHeaders={mediaHeaders}
                aspectRatio={1 / 1}
                toggleFullScreen={setImageFullScreen}
                isFullScreen={imageFullScreen}
              />
            </TouchableOpacity>
          ) : mediaUrl && mediaType === 'video' ? (
            <TouchableOpacity onPress={() => videoRef.current.presentFullscreenPlayer()}>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Video
                  ref={videoRef}
                  style={{
                    display: 'none',
                  }}
                  source={{
                    uri: mediaUrl,
                    headers: mediaHeaders,
                  }}
                  useNativeControls={false}
                  resizeMode="cover"
                />
                <ImageWithCache
                  resizeMode="cover"
                  mediaUrl={mediaUrl}
                  mediaHeaders={mediaHeaders}
                  aspectRatio={1 / 1}
                />
                <View style={{
                  position: 'absolute',
                  backgroundColor: themeStyle.colors.grayscale.black,
                  borderRadius: 100,
                }}
                >
                  <MaterialCommunityIcons
                    name="play"
                    size={60}
                    color={themeStyle.colors.grayscale.white}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ) : null}
          {body ? (
            <Text style={{ color: themeStyle.colors.grayscale.white }}>
              {body}
            </Text>
          ) : null}
          <Text style={{
            fontSize: 12,
            fontWeight: '700',
            textAlign: 'right',
            color: 'white',
            alignSelf: belongsToSender ? 'flex-end' : 'flex-start',
            marginVertical: 5,
          }}
          >
            {stringTime}
          </Text>
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
  },
  subContainer: {
    marginHorizontal: 10,
    flex: 1,
  },
});

export default MessageBox;
