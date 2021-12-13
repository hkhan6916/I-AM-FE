import React from 'react';
import { View, TouchableHighlight, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import themeStyle from '../theme.style';

const Avatar = ({
  navigation, userId, size, avatarUrl, preventClicks, hasBorder, profileGifHeaders,
}) => (
  <View style={{
    alignSelf: 'flex-start',
    width: size,
    height: size,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: hasBorder ? 2 : 0,
    borderColor: themeStyle.colors.primary.default,
  }}
  >
    {!preventClicks
      ? (
        <TouchableHighlight
          onPress={() => navigation.navigate('UserProfileScreen',
            { userId })}
          underlayColor={themeStyle.colors.grayscale.mediumGray}
        >
          <FastImage
            source={{ uri: avatarUrl, headers: profileGifHeaders || {} }}
            style={{
              borderRadius: 10,
              alignSelf: 'center',
              width: size,
              height: size,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableHighlight>
      )
      : (
        <View>
          <FastImage
            source={{ uri: avatarUrl, headers: profileGifHeaders || {} }}
            resizeMode={FastImage.resizeMode.cover}
            style={{
              borderRadius: 10,
              alignSelf: 'center',
              width: size,
              height: size,
            }}
          />
        </View>
      )}
  </View>
);

export default Avatar;
