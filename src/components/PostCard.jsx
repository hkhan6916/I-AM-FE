import React, { useEffect, useState } from 'react';
import {
  Text, View, Image, StyleSheet, TouchableHighlight, TouchableOpacity,
} from 'react-native';
import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

import themeStyle from '../theme.style';
import apiCall from '../helpers/apiCall';

const PostCard = ({ post: initialPost, hideActions = false, isPreview = false }) => {
  const [post, setPost] = useState(initialPost);
  const navigation = useNavigation();
  const shouldFlip = post.mediaIsSelfie;

  const handleReaction = async () => {
    if (post.liked) {
      const newPost = { ...post };
      newPost.liked = false;
      newPost.likes -= 1;
      setPost(newPost);
      const { success } = await apiCall('GET', `/posts/like/remove/${post._id}`);
      if (!success) {
        setPost(initialPost);
      }
    } else {
      const newPost = { ...post, liked: true };
      newPost.liked = true;
      newPost.likes += 1;
      setPost(newPost);
      const { success } = await apiCall('GET', `/posts/like/add/${post._id}`);
      if (!success) {
        setPost(initialPost);
      }
    }
  };

  const PostAge = () => {
    const { age } = post;
    let ageObject = { unit: age.days > 1 ? 'days' : 'day', age: age.days };
    if (age.minutes) {
      ageObject = { unit: age.minutes > 1 ? 'minutes' : 'minute', age: age.minutes };
    } if (age.hours) {
      ageObject = { unit: age.hours > 1 ? 'hours' : 'hour', age: age.hours };
    }

    return (
      <Text style={styles.postAge}>
        {ageObject.age}
        {' '}
        {ageObject.unit}
        {' '}
        ago
      </Text>
    );
  };
  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);
  return (
    <View style={[styles.container, isPreview && {
      margin: 20,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderTopWidth: 1,
      borderRadius: 10,
    }]}
    >
      {post.postAuthor && (
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 5,
        borderTopWidth: isPreview ? 0 : 0.5,
        borderBottomWidth: 0.5,
        borderColor: themeStyle.colors.grayscale.lightGray,
      }}
      >
        <View style={{
          alignSelf: 'flex-start',
          width: 50,
          height: 50,
          borderRadius: 50,
          overflow: 'hidden',
        }}
        >
          <TouchableHighlight
            onPress={() => navigation.navigate('UserProfileScreen',
              { userId: post.postAuthor._id })}
            underlayColor={themeStyle.colors.grayscale.mediumGray}
          >
            <Image
              source={{ uri: post.postAuthor.profileGifUrl }}
              resizeMode="cover"
              style={{
                borderRadius: 10,
                alignSelf: 'center',
                width: 50,
                height: 50,
              }}
            />
          </TouchableHighlight>
        </View>
        <View style={{
          display: 'flex', justifyContent: 'center', marginLeft: 20,
        }}
        >
          <Text numberOfLines={1} style={{ fontWeight: '700', maxWidth: 200 }}>{post.postAuthor.username}</Text>
          <Text style={{ maxWidth: 200 }} numberOfLines={1}>
            {post.postAuthor.firstName}
            {' '}
            {post.postAuthor.lastName}
          </Text>
          {post.postAuthor.jobTitle && (
          <Text
            numberOfLines={1}
            style={{ color: themeStyle.colors.grayscale.mediumGray, maxWidth: 200 }}
          >
            {post.postAuthor.jobTitle}
          </Text>
          )}
        </View>
      </View>
      )}
      {post.repostPostObj
        ? (
          <TouchableHighlight
            style={{ borderWidth: 20, borderColor: 'blue' }}
            onPress={() => navigation.navigate('PostScreen', { post: post.repostPostObj })}
            underlayColor={themeStyle.colors.grayscale.mediumGray}
          >
            <View style={{
              margin: 5,
            }}
            >
              {post.repostPostObj.mediaType === 'video'
                ? (
                  <Video
                    style={{
                      width: 100,
                      height: 100,
                    }}
                    source={{
                      uri: post.mediaUrl,
                    }}
                    useNativeControls
                    resizeMode="cover"
                    isLooping
                  />
                ) : post.repostPostObj.mediaType === 'image'
                  ? (
                    <View style={{
                      flex: 1,
                      flexDirection: 'column',
                      transform: [{
                        rotate: post.repostPostObj.mediaOrientation === 'landscape-left' ? '-90deg'
                          : post.repostPostObj.mediaOrientation === 'landscape-right' ? '90deg' : '0deg',
                      }],
                    }}
                    >
                      <Image
                        resizeMode="cover"
                        source={{ uri: post.repostPostObj.mediaUrl }}
                        style={{
                          borderRadius: 10,
                          aspectRatio: 1 / 1,
                          width: '100%',
                        }}
                      />
                    </View>
                  )
                  : null}
              {post.body
                ? (
                  <View style={{ margin: 5 }}>
                    <Text style={{ textAlign: 'left' }}>
                      {post.body}
                    </Text>
                  </View>
                ) : null}
              {post.repostPostObj.body
                ? (
                  <View style={{ margin: 5 }}>
                    <Text style={{ textAlign: 'left' }}>
                      {post.repostPostObj.body}
                    </Text>
                  </View>
                ) : null}
            </View>
          </TouchableHighlight>
        )
        : (
          <TouchableHighlight
            style={[shouldFlip && {
              transform: [
                { scaleX: -1 },
              ],
            }]}
            onPress={() => navigation.navigate('PostScreen', { post })}
            underlayColor={themeStyle.colors.grayscale.mediumGray}
          >
            <View style={{
              margin: 5,
            }}
            >
              {post.mediaType === 'video'
                ? (
                  <Video
                    style={{
                      width: 100,
                      height: 100,
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
                    <View style={{
                      flex: 1,
                      flexDirection: 'column',
                      transform: [{
                        rotate: post.mediaOrientation === 'landscape-left' ? '-90deg'
                          : post.mediaOrientation === 'landscape-right' ? '90deg' : '0deg',
                      }],
                    }}
                    >
                      <Image
                        resizeMode="cover"
                        source={{ uri: post.mediaUrl }}
                        style={{
                          borderRadius: 10,
                          aspectRatio: 1 / 1,
                          width: '100%',
                        }}
                      />
                    </View>
                  )
                  : null}
              {post.body
                ? (
                  <View style={{ margin: 5 }}>
                    <Text style={{ textAlign: 'left' }}>
                      {post.body}
                    </Text>
                  </View>
                ) : null}
            </View>
          </TouchableHighlight>
        )}
      {!hideActions
      && (
        <View>
          <View style={{
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'space-between',
          }}
          >
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={() => handleReaction()}
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginHorizontal: 5,
                }}
              >
                <MaterialCommunityIcons
                  name={post.liked ? 'thumb-up' : 'thumb-up-outline'}
                  size={24}
                  color={post.liked ? themeStyle.colors.secondary.default
                    : themeStyle.colors.grayscale.mediumGray}
                />
              </TouchableOpacity>
              <TouchableOpacity style={{
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 5,
              }}
              >
                <FontAwesome name="comment-o" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('RepostScreen', {
                prevScreen: 'Home',
                post: post.repostPostObj || post,
              })}
              style={{
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 5,
                justifySelf: 'flex-end',
              }}
            >
              <FontAwesome name="paper-plane-o" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <Text>
            {post.likes}
            {' '}
            likes
          </Text>
          <PostAge />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderColor: themeStyle.colors.grayscale.lightGray,
    marginTop: 20,
  },
  postAge: {
    color: themeStyle.colors.grayscale.mediumGray,
    marginHorizontal: 10,
  },
});

export default PostCard;
