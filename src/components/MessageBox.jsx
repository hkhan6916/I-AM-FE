import React from 'react';
import {
  View, Text, StyleSheet,
} from 'react-native';
import ImageWithCache from './ImageWithCache';
import themeStyle from '../theme.style';

const MessageBox = ({
  belongsToSender, message,
}) => {
  const {
    user, body, mediaUrl, mediaHeaders, stringDate, stringTime,
  } = message;
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <View style={styles.messageInfo}>
          <Text style={styles.senderName}>
            {belongsToSender ? 'Me' : `${user.firstName} ${user.lastName}`}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '700' }}>
            {stringTime}
          </Text>
        </View>
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
};

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
    marginRight: 10,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subContainer: {
    marginHorizontal: 10,
  },
});

export default MessageBox;
