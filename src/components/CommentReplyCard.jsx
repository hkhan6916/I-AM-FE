import React from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import themeStyle from '../theme.style';
import Avatar from './Avatar';

const CommentReplyCard = ({ reply, handleReplyToReply }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.replyContainer}>
      <View style={styles.profileInfoContainer}>
        {/* <Avatar
          hasBorder
          isClickable
          userId={reply.userId}
          navigation={navigation}
          avatarUrl={reply.replyAuthor.profileGifUrl}
          size={35}
        /> */}
        <TouchableOpacity onPress={() => navigation.navigate('UserProfileScreen',
          { userId: reply.userId })}
        >
          <Text style={styles.replyAuthorName} numberOfLines={1}>
            {reply.replyAuthor?.firstName}
            {' '}
            {reply.replyAuthor?.lastName}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.replyBodyContainer}>
        {reply.replyingToObj && reply.replyingToId
          ? (
            <TouchableOpacity onPress={() => navigation.navigate('UserProfileScreen',
              { userId: reply.replyingToId })}
            >
              <Text style={{
                color: themeStyle.colors.secondary.default,
                fontWeight: '700',
                justifyContent: 'center',
              }}
              >
                {reply.replyingToObj.firstName}
                {' '}
                {reply.replyingToObj.lastName}
                {' '}
              </Text>
            </TouchableOpacity>
          )
          : null}
        <Text>
          {reply.body}
        </Text>
      </View>
      <View style={styles.actionsContainer}>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => handleReplyToReply({
              firstName: reply.replyAuthor.firstName,
              lastName: reply.replyAuthor.lastName,
              commentId: reply._id,
            })}
            style={styles.replyTrigger}
          >
            <Text style={{ color: themeStyle.colors.grayscale.mediumGray, fontWeight: '700' }}>Reply</Text>
          </TouchableOpacity>
          {!reply.belongsToUser ? (
            <TouchableOpacity
              // onPress={() => handleReaction()}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 5,
              }}
            >
              <MaterialCommunityIcons
                name={reply.liked ? 'thumb-up' : 'thumb-up-outline'}
                size={20}
                color={reply.liked ? themeStyle.colors.secondary.default
                  : themeStyle.colors.grayscale.mediumGray}
              />
            </TouchableOpacity>
          ) : null}
          {reply.likes > 0
            ? (
              <Text style={{ color: themeStyle.colors.grayscale.black, marginLeft: 10 }}>
                {reply.likes}
                {' '}
                {reply.likes > 1 ? 'likes' : 'like'}
              </Text>
            )
            : null}
        </View>
      </View>
    </View>
  );
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
  profileInfoContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
  },
  replyBodyContainer: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyAuthorName: {
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
});
export default React.memo(CommentReplyCard);
