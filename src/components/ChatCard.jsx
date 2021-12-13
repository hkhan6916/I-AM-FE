import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import themeStyle from '../theme.style';
import Avatar from './Avatar';

const ChatCard = ({ chat }) => {
  const user = chat.users[0];
  return (
    <View style={styles.container}>
      <Avatar
        preventClicks
        size={50}
        avatarUrl={user.profileGifUrl}
        profileGifHeaders={user.profileGifHeaders}
      />
      <View style={styles.chatInfo}>
        <Text numberOfLines={1} style={{ fontWeight: '600', fontSize: 16 }}>
          {user.firstName}
          {' '}
          {user.lastName}
        </Text>
        <Text numberOfLines={1}>{chat.previewMessage}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderBottomWidth: 0.5,
    borderBottomColor: themeStyle.colors.grayscale.lightGray,
    paddingVertical: 10,
    marginHorizontal: 20,
  },
  chatInfo: {
    marginHorizontal: 20,
  },
});

export default ChatCard;
