import React, { useEffect, useRef, useState } from "react";
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
  style = {},
}) => {
  const [ready, setReady] = useState(false);
  const calculatedImage =
    height && width && (Number(height) / Number(width)) * screenWidth;

  const decidedHeight =
    calculatedImage < screenHeight / 1.4 ? calculatedImage : screenHeight / 1.4;

  const imageRef = useRef({});

  const src = mediaUrl;
  const options = {
    headers: mediaHeaders,
  };
  useEffect(() => {
    fetch(src, options)
      .then((res) => res.blob())
      .then((blob) => {
        setReady(true);
        if (imageRef?.current) {
          imageRef.current.src = URL.createObjectURL(blob);
        }
      })
      .catch((err) => console.log({ err }));
  }, []);

  return (
    <div
      style={{
        width: screenWidth,
        maxWidth: 900,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <img
        ref={imageRef}
        style={{
          flex: 1,
          width: screenWidth,
          height: isFull ? screenHeight / 1.2 : decidedHeight,
          maxHeight: Math.min(screenHeight - 100, 900),
          maxWidth: 900,
          backgroundColor: themeStyle.colors.black,
          objectFit: "contain",
          ...(!height || !width
            ? {
                width: screenWidth,
                height: screenWidth,
                aspectRatio: 1 / 1,
              }
            : {}),
          ...style,
        }}
      />
    </div>
  );
};

export default CardImage;
