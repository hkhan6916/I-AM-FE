import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import PostCommentCard from '../../../components/PostCommentCard';
import apiCall from '../../../helpers/apiCall';
import themeStyle from '../../../theme.style';
import CommentTextInput from '../../../components/CommentTextInput';

const CommentsScreen = (props) => {
  const { postId } = props.route.params;

  //   const [commentBody, setCommentBody] = useState('');
  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [allCommentsLoaded, setAllCommentsLoaded] = useState(false);
  const [newReply, setNewReply] = useState(null);
  const navigation = useNavigation();
  const textInputRef = useRef();

  const getComments = async () => {
    if (!allCommentsLoaded) {
      const { response, success } = await apiCall('GET', `/posts/comments/${postId}/${comments.length}`);
      if (success) {
        if (!response.length) {
          setAllCommentsLoaded(true);
        } else {
          setComments([...comments, ...response]);
        }
      }
    }
  };

  const postComment = async (commentBody) => {
    if (replyingTo && replyingTo.commentId) {
      const { response, success, message } = await apiCall('POST', '/posts/comments/replies/add', {
        commentId: replyingTo.commentId,
        body: commentBody,
      });
      console.log(message);
      if (success) {
        response.age = { minutes: 1 };

        setNewReply({ replyingToObj: replyingTo, ...response });
        // setCommentBody('');
      }
    } else {
      const { response, success } = await apiCall('POST', '/posts/comments/add', {
        postId,
        body: commentBody,
      });
      if (success) {
        response.age = { minutes: 1 };
        const updatedComments = [response, ...comments];

        setComments(updatedComments);
        // setCommentBody('');
      }
    }
  };

  const replyToUser = async ({
    commentId, firstName, lastName, replyingToType,
  }) => {
    if (firstName && lastName && commentId && replyingToType) {
      if (replyingToType === 'reply') {
        textInputRef.current.focus();
        setReplyingTo({
          lastName, firstName, commentId, replyingToType,
        });
      }

      if (replyingToType === 'comment') {
        console.log();
      }
    }
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y
      >= contentSize.height - paddingToBottom;
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      await getComments();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView
        scrollEventThrottle={0}
        contentContainerStyle={styles.commentsContainer}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            getComments();
          }
        }}
      >
        {comments.length ? comments.map((comment, i) => (
          <PostCommentCard newReply={newReply} replyToUser={replyToUser} key={comment._id || `comment-${i}`} comment={comment} />
        )) : null}
      </ScrollView>
      <View style={styles.inputBoxContainer}>
        <CommentTextInput
          ref={textInputRef}
          submitAction={postComment}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  commentsContainer: {
    flexGrow: 1,
  },
});

export default CommentsScreen;
