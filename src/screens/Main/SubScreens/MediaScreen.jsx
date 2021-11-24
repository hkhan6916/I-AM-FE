import React, { useEffect, useState } from 'react';

import {
  Text, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import * as ScreenOrientation from 'expo-screen-orientation';
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import VideoPlayer from '../../../components/VideoPlayer';
import themeStyle from '../../../theme.style';

const MediaScreen = (props) => {
  const [showActions, setShowActions] = useState(false);
  const { post } = props.route.params;
  const shouldFlip = post?.mediaIsSelfie;
  const navigation = useNavigation();
  useEffect(() => {
    (async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    })();
    return async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View>
        {post?.mediaType === 'video'
          ? (
            <VideoPlayer
              url={post.mediaUrl}
              isFullScreen
              setShowActions={setShowActions}
            />
          ) : post?.mediaType === 'image'
            ? (
              <View style={{
                transform: [{
                  scaleX: shouldFlip ? -1 : 0,
                  rotate: post.mediaOrientation === 'landscape-left' ? '-90deg'
                    : post.mediaOrientation === 'landscape-right' ? '90deg' : '0deg',
                }],
              }}
              >
                <FastImage
                  resizeMode={FastImage.resizeMode.contain}
                  source={{ uri: post.mediaUrl }}
                  style={{
                    maxWidth: '100%', minWidth: '100%', maxHeight: '100%', minHeight: '100%',
                  }}
                />
              </View>
            )
            : null}
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={{
            position: 'absolute',
            left: 10,
            top: 10,
          }}
        >
          <View style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: showActions ? 1 : 0.5,
          }}
          >
            <Ionicons name="arrow-back" size={26} color={themeStyle.colors.grayscale.white} />
            <Text style={{ color: themeStyle.colors.grayscale.white, fontSize: 16 }}>
              Home
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableWithoutFeedback>
          <View style={{
            position: 'absolute',
            bottom: 40,
            right: 0,
            // backgroundColor: themeStyle.colors.grayscale.mediumGray,
            opacity: showActions ? 1 : 0.2,
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
          }}
          >
            <Text style={{ color: themeStyle.colors.grayscale.white, margin: 20 }}>
              <FontAwesome name="comment-o" size={24} color="white" />
            </Text>
            <Text style={{ color: themeStyle.colors.grayscale.white, margin: 20 }}>
              <MaterialCommunityIcons
                name={post.liked ? 'thumb-up' : 'thumb-up-outline'}
                size={24}
                color={post.liked ? themeStyle.colors.secondary.default
                  : themeStyle.colors.grayscale.white}
              />
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeStyle.colors.grayscale.black,
  },
});

export default MediaScreen;
