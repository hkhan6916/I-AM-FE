import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Button,
} from 'react-native';
import themeStyle from '../../theme.style';
import apiCall from '../../helpers/apiCall';

const PostScreen = () => {
  const [postBody, setPostBody] = useState('');
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  const createPost = async () => {
    const postData = new FormData();
    postData.append('file', file);
    postData.append('postBody', postBody);

    const { success, response } = apiCall('POST', '/post/new');
    if (!success) {
      setError({ title: "Well... that wasn't supposed to happen!", message: 'An error occured creating your post.' });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={{ borderWidth: 2 }}
        multiline
        maxLength={50}
        numberOfLines={8}
        onChangeText={(v) => setPostBody(v)}
        value={postBody}
      />
      {postBody.length >= 50 - 25 ? (
        <Text style={styles.postLimitMessage}>
          {50 - postBody.length}
          {' '}
          Characters Remaining
        </Text>
      ) : null}
      <Button title="Make Post" onPress={() => createPost()} />
      {error ? (
        <View>
          <Text style={styles.errorTitle}>{error.title}</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
        </View>
      ) : null}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  postLimitMessage: {
    alignSelf: 'flex-end',
    color: themeStyle.colors.error.default,
  },
  errorTitle: {
    textAlign: 'center',
    color: themeStyle.colors.error.default,
    fontSize: 16,
  },
  errorMessage: {
    textAlign: 'center',
    fontSize: 14,
    color: themeStyle.colors.error.default,
  },
});

export default PostScreen;
