import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import themeStyle from '../theme.style';
import Avatar from './Avatar';
import apiCall from '../helpers/apiCall';

const PostCommentCard = ({ comment: initialComment }) => {
  const navigation = useNavigation();
  const [comment, setComment] = useState(initialComment);
  const handleReaction = async () => {
    if (comment.liked) {
      const newPost = comment;
      newPost.liked = false;
      newPost.likes -= 1;
      setComment(newPost);
      const { success } = await apiCall('GET', `/posts/comment/like/remove/${comment._id}`);
      if (!success) {
        setComment(initialComment);
      }
    } else {
      const newPost = comment;
      newPost.liked = true;
      newPost.likes += 1;
      setComment(newPost);
      const { success } = await apiCall('GET', `/posts/comment/like/add/${comment._id}`);
      if (!success) {
        setComment(initialComment);
      }
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.profileImageContainer}>
        <Avatar
          hasBorder
          isClickable
          userId={comment.userId}
          navigation={navigation}
          avatarUrl={comment.commentAuthor.profileGifUrl}
          size={40}
        />
        <TouchableOpacity onPress={() => navigation.navigate('UserProfileScreen',
          { userId: comment.userId })}
        >
          <Text style={styles.commentAuthorName} numberOfLines={1}>
            {comment.commentAuthor?.firstName}
            {' '}
            {comment.commentAuthor?.lastName}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.commentBodyContainer}>
        <Text>
          {comment.body}
        </Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.replyTrigger}>
          <Text style={{ color: themeStyle.colors.grayscale.mediumGray }}>Reply</Text>
        </TouchableOpacity>
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
            name={comment.liked ? 'thumb-up' : 'thumb-up-outline'}
            size={24}
            color={comment.liked ? themeStyle.colors.secondary.default
              : themeStyle.colors.grayscale.black}
          />
        </TouchableOpacity>
        <Text>
          Likes
          {' '}
          {comment.likes}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 0.5,
    borderColor: themeStyle.colors.grayscale.mediumGray,
  },
  profileImageContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
  },
  commentBodyContainer: {
    padding: 10,
  },
  commentAuthorName: {
    maxWidth: 170,
    marginLeft: 10,
    color: themeStyle.colors.secondary.default,
    fontWeight: '700',
  },
  actionsContainer: {
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
  },
  replyTrigger: {
    marginRight: 10,
  },
  likeTrigger: {
    marginRight: 10,
  },
});
export default PostCommentCard;
