import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Button, ScrollView, TextInput,
} from 'react-native';
import apiCall from '../../../helpers/apiCall';
import PostCard from '../../../components/PostCard';

const RepostScreen = (props) => {
  const {
    prevScreen,
    post,
  } = props.route.params;
  // const [post, setPost] = useState(initialPost);
  const [repostBody, setRepostBody] = useState('');
  const navigation = useNavigation();

  const handleRepost = async () => {
    const { success, message } = await apiCall('POST', `/posts/repost/${post._id}`, { body: repostBody });

    if (success) {
      navigation.navigate(prevScreen);
    } else {
      console.log(message);
    }
  };

  // useEffect(() => {
  //   (async () => {
  //     const { response, success, message } = await apiCall('GET', `/user/${post.userId}`);
  //     if (success) {
  //       setPost({});
  //       setPost({ ...initialPost, postAuthor: { ...response.user } });
  //       // console.log('a', { ...initialPost, postAuthor: { ...response.user } }, 'b');
  //     }
  //   })();
  //   return () => {
  //     setRepostBody('');
  //     setPost({});
  //   };
  // }, []);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <TextInput
        style={{ minHeight: 100, textAlignVertical: 'top' }}
        value={repostBody || ''}
        placeholder="What's on your mind?"
        multiline
        maxLength={1000}
        onChangeText={(v) => setRepostBody(v)}
      />
      <Button title="Repost" onPress={() => handleRepost()} />
      <PostCard post={post} hideActions isPreview />
    </ScrollView>
  );
};

export default RepostScreen;
