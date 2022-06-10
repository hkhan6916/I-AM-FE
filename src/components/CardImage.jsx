import FastImage from "react-native-fast-image";
import React from "react";
import themeStyle from "../theme.style";
import { Image } from "react-native";

const CardImage = ({
  screenWidth,
  screenHeight,
  mediaUrl,
  mediaHeaders,
  width = 0,
  height = 0,
  isFull = false,
  style,
}) => {
  const calculatedImage =
    height && width && (Number(height) / Number(width)) * screenWidth;

  const decidedHeight =
    calculatedImage < screenHeight / 1.4 ? calculatedImage : screenHeight / 1.4;
  return (
    <Image
      source={{
        uri: mediaUrl,
        headers: mediaHeaders,
      }}
      resizeMode="contain"
      style={[
        {
          width: screenWidth,
          height: isFull ? screenHeight / 1.2 : decidedHeight,
          backgroundColor: themeStyle.colors.black,
        },
        (!height || !width) && {
          width: screenWidth,
          height: screenWidth,
          aspectRatio: 1 / 1,
        },
        style,
      ]}
    />
  );
};

export default CardImage;
