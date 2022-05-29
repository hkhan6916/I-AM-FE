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
}) => {
  const imageHeight =
    height && width && (Number(height) / Number(width)) * screenWidth;

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
          height:
            imageHeight < screenHeight / 1.4 ? imageHeight : screenHeight / 1.4,
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
