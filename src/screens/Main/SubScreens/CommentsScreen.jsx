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

  const [commentBody, setCommentBody] = useState('');
  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isReply, setIsReply] = useState(false);
  const [allCommentsLoaded, setAllCommentsLoaded] = useState(false);

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

  const postComment = async () => {
    // const { response, success } = await apiCall('POST', '/posts/comments/add', {
    //   postId,
    //   body: commentBody,
    // });
    // if (success) {
    //   response.age = { minutes: 1 };
    //   const updatedComments = [response, ...comments];

    //   setComments(updatedComments);
    //   setCommentBody('');
    // }
    if (replyingTo) {
      console.log('this will be a reply request');
    } else {
      console.log('this will be a reply request');
    }
  };

  const replyToUser = async ({
    commentId, firstName, lastName, replyingTo,
  }) => {
    if (firstName && lastName) {
      if (replyingTo === 'reply') {
        setIsReply(true);
        textInputRef.current.focus();
        setReplyingTo({ lastName, firstName });
        //   const { response, success } = await apiCall('POST', '/posts/comments/replies/add', {
        //     commentId,
        //     body: commentBody,
        //   });

        setIsReply(false);
      }

      if (replyingTo === 'comment') {
        console.log();
        setIsReply(false);
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
          <PostCommentCard replyToUser={replyToUser} key={comment._id || `comment-${i}`} comment={comment} />
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
