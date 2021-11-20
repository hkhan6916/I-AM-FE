import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
} from 'react-native';
import PostCommentCard from '../../../components/PostComment';
import apiCall from '../../../helpers/apiCall';
import themeStyle from '../../../theme.style';

const CommentsScreen = (props) => {
  const { postId } = props.route.params;
  const [offset, setOffset] = useState(0);
  const [commentBody, setCommentBody] = useState('');
  const [comments, setComments] = useState([]);

  const postComment = async () => {
    const { response, success } = await apiCall('POST', '/posts/comments/add', {
      postId,
      body: commentBody,
    });

    if (success) {
      setComments([response, ...comments]);
      setCommentBody('');
    }
  };

  useEffect(() => {
    (async () => {
      const { response, success } = await apiCall('GET', `/posts/comments/${postId}/${offset}`);
      if (success) {
        setComments(response);
      }
    })();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.commentsContainer}>
        {comments.map((comment) => (
          <PostCommentCard key={comment._id} comment={comment} />
        ))}
      </View>
      <View style={styles.inputBoxContainer}>
        <TextInput
          style={styles.inputBox}
          placeholder="Type a comment..."
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
    flex: 1,
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
