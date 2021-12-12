import React from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';

const ImageWithCache = ({
  resizeMode, aspectRatio, mediaUrl, mediaIsSelfie, mediaOrientation, mediaHeaders,
}) => (
  <View style={{
    transform: [
      { scaleX: mediaIsSelfie ? -1 : 1 },
    ],
  }}
  >
    <View style={{
      transform: [{
        rotate: mediaOrientation === 'landscape-left' ? '-90deg'
          : mediaOrientation === 'landscape-right' ? '90deg' : '0deg',
      }],
    }}
    >
      <FastImage
        resizeMode={resizeMode === 'cover' ? FastImage.resizeMode.cover : FastImage.resizeMode.contain}
        source={{ uri: mediaUrl, headers: mediaHeaders || {} }}
        style={{
          borderRadius: 10,
          aspectRatio,
          width: '100%',
        }}
      />
    </View>
  </View>
);

export default ImageWithCache;
