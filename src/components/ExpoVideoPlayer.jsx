import { Dimensions } from "react-native";
import { Video } from "expo-av";
import React, { useCallback, useRef } from "react";
import VideoPlayer from "expo-video-player";
import useScreenOrientation from "../helpers/hooks/useScreenOrientation";
import { useFocusEffect } from "@react-navigation/native";

const ExpoVideoPlayer = ({ uri }) => {
  useScreenOrientation(true); // just forces a re render ONLY when screen rotates. Without this, video does not adjust for landscape viewing.
  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

  const videoRef = useRef();

  useFocusEffect(
    useCallback(() => {
      return async () => {
        await videoRef.current?.setStatusAsync({
          shouldPlay: false,
        });
      };
    }, [])
  );
  return (
    <VideoPlayer
      autoHidePlayer={false}
      timeVisible
      videoProps={{
        ref: videoRef,
        shouldPlay: true,
        resizeMode: Video.RESIZE_MODE_CONTAIN,
        source: {
          uri: uri,
        },
        style: {
          width: screenWidth,
          height: screenHeight / 1.1,
          transform: [{ scaleX: -1 }],
        },
      }}
      fullscreen
    />
  );
};

export default React.memo(ExpoVideoPlayer);
