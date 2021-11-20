import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity,
} from 'react-native';
import Avatar from './Avatar';

const PostCommentCard = ({ comment }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.profileImageContainer}>
        <Avatar
          isClickable
          userId={comment.userId}
          navigation={navigation}
          avatarUrl={comment.commentAuthor.profileGifUrl}
          size={40}
        />
        <TouchableOpacity onPress={() => navigation.navigate('UserProfileScreen',
          { userId: comment.userId })}
        >
          <Text style={{ maxWidth: 200 }} numberOfLines={1}>
            {comment.commentAuthor.firstName}
            {' '}
            {comment.commentAuthor.lastName}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.commentBodyContainer}>
        <Text>
          {comment.body}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileImageContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    borderWidth: 1,
  },
  commentBodyContainer: {
    padding: 10,
  },
});
export default PostCommentCard;
