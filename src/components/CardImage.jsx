import FastImage from "react-native-fast-image";
import React from "react";
import themeStyle from "../theme.style";

const CardImage = ({
  screenWidth,
  screenHeight,
  mediaUrl,
  mediaHeaders,
  width = 0,
  height = 0,
  isFull = false,
}) => {
  const calculatedImage =
    height && width && (Number(height) / Number(width)) * screenWidth;

  const decidedHeight =
    calculatedImage < screenHeight / 1.4 ? calculatedImage : screenHeight / 1.4;
  return (
    <FastImage
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
          height: "100%",
          aspectRatio: 1 / 1,
        },
      ]}
    />
  );
};

export default CardImage;
