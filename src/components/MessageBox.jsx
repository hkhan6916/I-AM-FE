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
    body, mediaUrl, mediaHeaders, stringTime,
  } = message;
  return (
    <View style={styles.container}>
      <View style={[styles.subContainer, { alignItems: belongsToSender ? 'flex-end' : 'flex-start' }]}>
        <View style={styles.message}>
          <Text style={{
            fontSize: 12, fontWeight: '700', textAlign: 'right', color: 'white',
          }}
          >
            {stringTime}
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
            <Text style={{ color: themeStyle.colors.grayscale.white }}>
              {body}
            </Text>
          ) : null}
        </View>
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
  },
  senderName: {
    color: themeStyle.colors.grayscale.white,
    fontWeight: '700',
    marginRight: 10,
  },
  message: {
    backgroundColor: themeStyle.colors.primary.default,
    borderRadius: 10,
    padding: 5,
    marginLeft: 50,
  },
  subContainer: {
    marginHorizontal: 10,
    flex: 1,
  },
});

export default MessageBox;
