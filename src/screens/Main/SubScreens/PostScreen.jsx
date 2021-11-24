import React from 'react';
import { Video } from 'expo-av';
import {
  Text, View, StyleSheet,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import VideoPlayer from '../../../components/VideoPlayer';

const PostScreen = (props) => {
  const { post } = props.route.params;
  const shouldFlip = post?.mediaIsSelfie;

  return (
    <View style={[styles.container, shouldFlip && {
      transform: [
        { scaleX: -1 },
      ],
    }]}
    >
      {post?.mediaType === 'video'
        ? (
          // <Video
          //   style={{
          //   // width: '100%',
          //   // height: 400,
          //     width: 100,
          //     height: 100,
          //   // backgroundColor: themeStyle.colors.grayscale.black,
          //   }}
          //   source={{
          //     uri: post.mediaUrl,
          //   }}
          //   useNativeControls
          //   resizeMode="cover"
          // />
          <VideoPlayer
            url={post.mediaUrl}
          />
        ) : post?.mediaType === 'image'
          ? (
            <View style={{
              transform: [{
                rotate: post.mediaOrientation === 'landscape-left' ? '-90deg'
                  : post.mediaOrientation === 'landscape-right' ? '90deg' : '0deg',
              }],
              backgroundColor: 'red',
            }}
            >
              <FastImage
                resizeMode={FastImage.resizeMode.contain}
                source={{ uri: post.mediaUrl }}
                style={{
                  maxWidth: '100%', minWidth: '40%', maxHeight: '60%', minHeight: '40%',
                }}
              />
            </View>
          )
          : null}
      {post?.body
        ? (
          <View style={{ margin: 20 }}>
            <Text>
              {post.body}
            </Text>
          </View>
        ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PostScreen;
