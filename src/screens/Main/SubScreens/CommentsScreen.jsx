import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import PostCommentCard from '../../../components/PostCommentCard';
import apiCall from '../../../helpers/apiCall';
import themeStyle from '../../../theme.style';

const CommentsScreen = (props) => {
  const { postId } = props.route.params;

  const [commentBody, setCommentBody] = useState('');
  const [comments, setComments] = useState([]);
  const [allCommentsLoaded, setAllCommentsLoaded] = useState(false);

  const navigation = useNavigation();

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
    const { response, success } = await apiCall('POST', '/posts/comments/add', {
      postId,
      body: commentBody,
    });
    if (success) {
      response.age = { minutes: 1 };
      setComments([...comments, response]);
      setCommentBody('');
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
          <PostCommentCard key={comment._id || `comment-${i}`} comment={comment} />
        )) : null}
      </ScrollView>
      <View style={styles.inputBoxContainer}>
        <TextInput
          style={styles.inputBox}
          placeholder="Type a comment here..."
          value={commentBody}
          onChangeText={(v) => setCommentBody(v)}
          returnKeyType="go"
          onSubmitEditing={() => {
            postComment();
          }}
        />
        <TouchableOpacity onPress={() => postComment()}>
          <Text style={styles.postTrigger}>Post</Text>
        </TouchableOpacity>
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
  inputBox: {
    height: 48, flex: 1,
  },
  inputBoxContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: themeStyle.colors.grayscale.lightGray,
  },
  postTrigger: {
    color: themeStyle.colors.secondary.default,
    fontWeight: '700',
  },
});

export default CommentsScreen;
