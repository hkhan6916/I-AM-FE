import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import themeStyle from '../theme.style';
import Avatar from './Avatar';
import apiCall from '../helpers/apiCall';
import CommentReplyCard from './CommentReplyCard';
import formatAge from '../helpers/formatAge';

const PostCommentCard = ({ comment: initialComment }) => {
  const navigation = useNavigation();
  const [comment, setComment] = useState(initialComment);
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleReactionToComment = async () => {
    if (comment.liked) {
      const newPost = { ...comment, liked: false };
      newPost.likes -= 1;
      setComment(newPost);
      const { success } = await apiCall('GET', `/posts/comment/like/remove/${comment._id}`);
      if (!success) {
        setComment(initialComment);
      }
    } else {
      const newPost = { ...comment, liked: true };
      newPost.likes += 1;
      setComment(newPost);
      const { success } = await apiCall('GET', `/posts/comment/like/add/${comment._id}`);
      if (!success) {
        setComment(initialComment);
      }
    }
  };

  const getCommentReplies = async () => {
    setShowReplies(true);

    const { response, success } = await apiCall('GET', `/posts/comments/replies/${comment._id}/${replies.length}`);
    if (success) {
      setReplies([...replies, ...response]);
    }
  };

  const deleteComment = async () => {
    const { success } = await apiCall('DELETE', `/posts/comments/remove/${comment._id}`);
    if (success) {
      setDeleted(true);
    }
  };

  const CommentAge = () => {
    const { age } = comment;
    const ageObject = formatAge(age);

    return (
      <Text style={styles.commentAge}>
        {ageObject.age}
        {' '}
        {ageObject.unit}
        {' '}
        ago
      </Text>
    );
  };
  if (!deleted) {
    return (
      <View style={styles.container}>
        <View style={styles.profileInfoConatiner}>
          {/* <Avatar
          hasBorder
          isClickable
          userId={comment.userId}
          navigation={navigation}
          avatarUrl={comment.commentAuthor.profileGifUrl}
          size={40}
        /> */}
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
          <View style={styles.actions}>
            <TouchableOpacity style={styles.replyTrigger}>
              <Text style={{ color: themeStyle.colors.grayscale.mediumGray, fontWeight: '700' }}>Reply</Text>
            </TouchableOpacity>
            {!comment.belongsToUser ? (
              <TouchableOpacity
                onPress={() => handleReactionToComment()}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginHorizontal: 5,
                }}
              >
                <MaterialCommunityIcons
                  name={comment.liked ? 'thumb-up' : 'thumb-up-outline'}
                  size={20}
                  color={comment.liked ? themeStyle.colors.secondary.default
                    : themeStyle.colors.grayscale.mediumGray}
                />
              </TouchableOpacity>
            ) : null}
          </View>
          <View>
            {comment.likes > 0
              ? (
                <Text style={{ color: themeStyle.colors.grayscale.black }}>
                  {comment.likes}
                  {' '}
                  {comment.likes > 1 ? 'likes' : 'like'}
                </Text>
              )
              : null}
          </View>
        </View>
        {comment.replyCount && !replies.length
          ? (
            <View style={{ flex: 1, alignItems: 'center', padding: 10 }}>
              <TouchableOpacity onPress={() => getCommentReplies()}>
                <Text style={{ color: themeStyle.colors.grayscale.darkGray }}>
                  View
                  {' '}
                  {comment.replyCount}
                  {' '}
                  {comment.replyCount > 1 ? 'replies' : 'reply'}
                </Text>
              </TouchableOpacity>
            </View>
          )
          : null}
        {replies.length
          ? (
            <View style={{ flex: 1, alignItems: 'center', padding: 10 }}>
              <TouchableOpacity onPress={() => setShowReplies(!showReplies)}>
                <Text style={{ color: themeStyle.colors.grayscale.darkGray }}>
                  {showReplies ? 'Hide replies' : 'Show replies'}
                </Text>
              </TouchableOpacity>
            </View>
          )
          : null}
        {showReplies && replies.length ? replies.map((reply, i) => (
          <CommentReplyCard key={reply._id} reply={reply} />
        )) : null}

        {replies.length && comment.replyCount > replies.length && showReplies
          ? (
            <View style={{ flex: 1, alignItems: 'center', padding: 10 }}>
              <TouchableOpacity onPress={() => getCommentReplies()}>
                <Text style={{ color: themeStyle.colors.grayscale.darkGray }}>
                  Load more replies
                </Text>
              </TouchableOpacity>
            </View>
          )
          : null}
        <View style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'row' }}>
          <CommentAge />
          {comment.belongsToUser
            ? (
              <TouchableOpacity onPress={() => deleteComment()}>
                <Text style={{ color: themeStyle.colors.error.default, marginHorizontal: 10 }}>delete</Text>
              </TouchableOpacity>
            )
            : null}
        </View>
      </View>
    );
  } return (<View />);
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 0.5,
    borderColor: themeStyle.colors.grayscale.mediumGray,
    display: 'flex',
    flexDirection: 'column',
  },
  replyContainer: {
    marginLeft: 70,
  },
  profileInfoConatiner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
    flex: 1,
  },
  commentBodyContainer: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAuthorName: {
    maxWidth: 170,
    marginLeft: 10,
    color: themeStyle.colors.primary.default,
    fontWeight: '700',
  },
  actionsContainer: {
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyTrigger: {
    marginRight: 10,
  },
  likeTrigger: {
    marginRight: 10,
  },
  commentAge: {
    color: themeStyle.colors.grayscale.mediumGray,
    marginHorizontal: 10,
    marginVertical: 5,
    fontSize: 12,
  },
});
export default PostCommentCard;
