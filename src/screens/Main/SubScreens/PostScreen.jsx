import React from 'react';
import { Video } from 'expo-av';
import {
  Text, View, Image, StyleSheet,
} from 'react-native';

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
          <Video
            style={{
            // width: '100%',
            // height: 400,
              width: 100,
              height: 100,
            // backgroundColor: themeStyle.colors.grayscale.black,
            }}
            source={{
              uri: post.mediaUrl,
            }}
            useNativeControls
            resizeMode="cover"
            isLooping
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
              <Image
                resizeMode="cover"
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
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderTopWidth: 1,
    width: '100%',
    backgroundColor: 'blue',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PostScreen;
