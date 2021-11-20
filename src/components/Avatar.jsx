import React from 'react';
import { View, TouchableHighlight, Image } from 'react-native';
import themeStyle from '../theme.style';

const Avatar = ({
  navigation, userId, size, avatarUrl, isClickable, hasBorder,
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
    {isClickable
      ? (
        <TouchableHighlight
          onPress={() => navigation.navigate('UserProfileScreen',
            { userId })}
          underlayColor={themeStyle.colors.grayscale.mediumGray}
        >
          <Image
            source={{ uri: avatarUrl }}
            resizeMode="cover"
            style={{
              borderRadius: 10,
              alignSelf: 'center',
              width: size,
              height: size,
            }}
          />

        </TouchableHighlight>
      )
      : (
        <View>
          <Image
            source={{ uri: avatarUrl }}
            resizeMode="cover"
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
