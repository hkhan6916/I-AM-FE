import React from 'react';
import {
  View, Text, StyleSheet,
} from 'react-native';
import ImageWithCache from './ImageWithCache';
import themeStyle from '../theme.style';
import Avatar from './Avatar';

const MessageBox = ({
  user, body, mediaUrl, mediaHeaders, belongsToSender,
}) => (
  <View style={styles.container}>
    <Avatar initials={belongsToSender ? 'ME' : null} size={35} profileGifHeaders={user.profileGifHeaders} avatarUrl={user.profileGifUrl} />
    <View style={styles.subContainer}>
      <Text style={styles.senderName}>
        {user === 'sender' ? 'Me' : `${user.firstName} ${user.lastName}`}
      </Text>
      {mediaUrl ? (
        <ImageWithCache
          resizeMode="cover"
          mediaUrl={mediaUrl}
          mediaHeaders={mediaHeaders}
          aspectRatio={1 / 1}
        />
      ) : null}
      {body ? (
        <Text>{body}</Text>
      ) : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginLeft: 10,
    marginRight: 30,
  },
  senderName: {
    color: themeStyle.colors.grayscale.black,
    fontWeight: '700',
  },
  subContainer: {
    marginHorizontal: 10,
  },
});

export default MessageBox;
