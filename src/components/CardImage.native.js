import React, { useState } from "react";
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
  const [load, setLoad] = useState(false);
  const calculatedImage =
    height && width && (Number(height) / Number(width)) * screenWidth;

  const decidedHeight =
    calculatedImage < screenHeight / 1.4 ? calculatedImage : screenHeight / 1.4;
  return (
    <Image
      onLoad={() => setLoad(true)}
      source={{
        uri: mediaUrl,
        headers: mediaHeaders,
      }}
      resizeMode="contain"
      style={[
        {
          width: screenWidth,
          height: isFull ? screenHeight / 1.2 : decidedHeight,
          backgroundColor: load
            ? themeStyle.colors.black
            : themeStyle.colors.mediaLoad,
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
