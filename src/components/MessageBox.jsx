import React from 'react';
import {
  View, Text, StyleSheet, Image,
} from 'react-native';
import ImageWithCache from './ImageWithCache';
import themeStyle from '../theme.style';

const MessageBox = ({
  user, body, mediaUrl, mediaHeaders,
}) => (
  <View>
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
);

const styles = StyleSheet.create({
  senderName: {
    color: themeStyle.colors.grayscale.mediumGray,
  },
});

export default MessageBox;
