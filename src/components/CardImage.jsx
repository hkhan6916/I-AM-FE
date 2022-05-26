import FastImage from "react-native-fast-image";
import React from "react";

const CardImage = ({ screenWidth, mediaUrl, mediaHeaders, width, height }) => {
  const imageHeight =
    height && width && (Number(height) / Number(width)) * (screenWidth - 48);
  return (
    <FastImage
      source={{
        uri: mediaUrl,
        headers: mediaHeaders,
      }}
      resizeMode="contain"
      style={{
        flex: 1,
        borderWidth: 1,
        // width: "100%",
        height: 500,
        aspectRatio: 1,
      }}
    />
  );
};

export default CardImage;
