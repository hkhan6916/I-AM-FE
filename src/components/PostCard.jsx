import React from 'react';
import {
  Text, View, Image, StyleSheet,
} from 'react-native';
import { Video } from 'expo-av';
import themeStyle from '../theme.style';

const PostCard = ({ post }) => (
  <View style={styles.container}>
    {post.mediaType === 'video'
      ? (
        <Video
          style={{
            width: '100%',
            height: 400,
            // backgroundColor: themeStyle.colors.grayscale.black,
          }}
          source={{
            uri: post.mediaUrl,
          }}
          useNativeControls
          resizeMode="cover"
          isLooping
        />
      ) : post.mediaType === 'image'
        ? (
          <View style={{ transform: [{ rotate: post.mediaOrientation === 'landscape-left' ? '-90deg' : post.mediaOrientation === 'landscape-right' ? '90deg' : '0deg' }] }}>
            <Image
            // style={{ width: 30 }}
              resizeMode="contain"
              source={{ uri: post.mediaUrl }}
            // resizeMode="contain"
              style={{ aspectRatio: 3 / 2 }}
            />
            <Text>
              {post.mediaOrientation}
            </Text>
          </View>
        )
        : null}
    {post.body
      ? (
        <Text>
          {post.body}
        </Text>
      ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderTopWidth: 1,
    borderColor: themeStyle.colors.grayscale.lightGray,
    padding: 7,
    margin: 5,
  },
});

export default PostCard;
