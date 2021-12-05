import React from 'react';
import {
  View, Text, StyleSheet, Image,
} from 'react-native';
import ImageWithCache from './ImageWithCache';
import themeStyle from '../theme.style';

const MessageBox = ({ user, body, mediaUrl }) => (
  <View>
    <Text style={styles.senderName}>
      {user === 'sender' ? 'Me' : `${user.firstName} ${user.lastName}`}
    </Text>
    {mediaUrl ? (
    //   <ImageWithCache
    //     resizeMode="cover"
    //     mediaUrl={mediaUrl}
    //     aspectRatio={1 / 1}
    //   />
      <View style={{ width: 200, height: 200 }}>
        <Image
          source={{ uri: mediaUrl }}
          style={{
            borderRadius: 10,
            aspectRatio: 1 / 1,
            width: '100%',
          }}
        />
      </View>
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
