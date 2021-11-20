import React, { useEffect, useState } from 'react';
import {
  Text, View, Image, StyleSheet, TouchableHighlight, TouchableOpacity,
} from 'react-native';
import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import CustomVideoPlayer from './VideoPlayer';

import Avatar from './Avatar';
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
      const newPost = { ...post };
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
    let ageObject = { unit: age?.days > 1 ? 'days' : 'day', age: age?.days };
    if (age?.minutes) {
      ageObject = { unit: age?.minutes > 1 ? 'minutes' : 'minute', age: age?.minutes };
    } if (age?.hours) {
      ageObject = { unit: age?.hours > 1 ? 'hours' : 'hour', age: age?.hours };
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

  const RepostedPost = ({ postContent }) => (
    <TouchableHighlight
      style={styles.repostedPostContent}
      onPress={() => navigation.navigate('PostScreen', { post: postContent })}
      underlayColor={themeStyle.colors.grayscale.mediumGray}
    >
      <View>
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          padding: 7,
          borderBottomWidth: isPreview ? 0.5 : 0,
          borderColor: themeStyle.colors.grayscale.lightGray,
        }}
        >
          {/* <Avatar
            isClickable
            navigation={navigation}
            userId={postContent.postAuthor._id}
            size={50}
            avatarUrl={postContent.postAuthor.profileGifUrl}
          /> */}
          <View style={{
            display: 'flex',
            justifyContent: 'center',
            marginLeft: 20,
          }}
          >
            <Text numberOfLines={1} style={{ fontWeight: '700', maxWidth: 200 }}>{postContent.postAuthor.username}</Text>
            <Text style={{ maxWidth: 200 }} numberOfLines={1}>
              {postContent.postAuthor.firstName}
              {' '}
              {postContent.postAuthor.lastName}
            </Text>
          </View>
        </View>
        {postContent.mediaType === 'video'
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
              <Video
                style={{
                  borderRadius: 10,
                  aspectRatio: 1 / 1,
                  width: '100%',
                }}
                source={{
                  uri: postContent.mediaUrl,
                }}
                useNativeControls
                resizeMode="cover"
              />
              {/* <View /> */}

            </View>
          ) : postContent.mediaType === 'image'
            ? (
              <View style={{
                flex: 1,
                flexDirection: 'column',
                transform: [{
                  rotate: postContent.mediaOrientation === 'landscape-left' ? '-90deg'
                    : postContent.mediaOrientation === 'landscape-right' ? '90deg' : '0deg',
                }],
              }}
              >
                <Image
                  resizeMode="cover"
                  source={{ uri: postContent.mediaUrl }}
                  style={{
                    borderRadius: 10,
                    aspectRatio: 1 / 1,
                    width: '100%',
                  }}
                />
              </View>
            )
            : null}
        {postContent.body
          ? (
            <View style={{
              margin: 10,
            }}
            >
              <Text numberOfLines={4} style={{ textAlign: 'left' }}>
                {postContent.body}
              </Text>
            </View>
          ) : null}
      </View>
    </TouchableHighlight>
  );

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  return (
    <View style={[styles.container, isPreview && styles.preview]}>
      {post.likedBy && (
        <TouchableOpacity
          style={{ padding: 10 }}
          onPress={() => navigation.navigate('UserProfileScreen',
            { userId: post.likedBy._id })}
        >
          <Text style={{ fontWeight: '700' }}>
            {post.likedBy.firstName}
            {' '}
            {post.likedBy.lastName}
            {' '}
            liked this
          </Text>
        </TouchableOpacity>
      )}
      {post.postAuthor && (
      <View style={[styles.postAuthorContainer, !isPreview && { borderTopWidth: 0.5 }]}>
        {/* <Avatar
          isClickable
          navigation={navigation}
          userId={post.postAuthor._id}
          size={50}
          avatarUrl={post.postAuthor.profileGifUrl}
        /> */}
        <View style={{
          display: 'flex',
          justifyContent: 'center',
          marginLeft: 20,
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
          <View>
            <RepostedPost postContent={post.repostPostObj} />
            {post.body
              ? (
                <View style={{
                  padding: 5, marginHorizontal: 10,
                }}
                >
                  <Text style={{ textAlign: 'left' }}>
                    {post.body}
                  </Text>
                </View>
              ) : null}
          </View>
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
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'column',
                      transform: [{
                        rotate: post.mediaOrientation === 'landscape-left' ? '-90deg'
                          : post.mediaOrientation === 'landscape-right' ? '90deg' : '0deg',
                      }],
                    }}
                  >
                    <CustomVideoPlayer url={post.mediaUrl} />

                  </View>
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
                  <View style={{
                    padding: 5,
                  }}
                  >
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
                    : themeStyle.colors.grayscale.black}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('CommentsScreen', {
                  postId: post._id,
                })}
                style={{
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
          <Text style={{ marginHorizontal: 10, marginVertical: 5 }}>
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
    marginVertical: 5,
    fontSize: 12,
  },
  preview: {
    margin: 20,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderRadius: 10,
  },
  postAuthorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
    borderColor: themeStyle.colors.grayscale.lightGray,
  },
  postAuthorProfilePic: {
    alignSelf: 'flex-start',
    width: 50,
    height: 50,
    borderRadius: 50,
    overflow: 'hidden',
  },
  postAuthorProfilePicImage: {
    borderRadius: 10,
    alignSelf: 'center',
    width: 50,
    height: 50,
  },
  repostedPostContent: {
    borderWidth: 1,
    borderColor: themeStyle.colors.grayscale.lightGray,
    borderRadius: 10,
    margin: 10,
  },
});

export default PostCard;
