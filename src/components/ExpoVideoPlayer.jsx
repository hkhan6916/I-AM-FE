import { Dimensions, StatusBar, View } from "react-native";
import { Video } from "expo-av";
import React from "react";
import VideoPlayer from "expo-video-player";
import useScreenOrientation from "../helpers/hooks/useScreenOrientation";

const ExpoVideoPlayer = ({ uri }) => {
  useScreenOrientation(true); // just forces a re render ONLY when screen rotates. Without this, video does not adjust for landscape viewing.
  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

  return (
    <View>
      <StatusBar hidden />
      <VideoPlayer
        autoHidePlayer={false}
        videoProps={{
          shouldPlay: true,
          resizeMode: Video.RESIZE_MODE_CONTAIN,
          source: {
            uri: uri,
          },
        }}
        fullscreen={true}
        style={{
          width: screenWidth,
          height: screenHeight,
        }}
      />
    </View>
  );
};

export default ExpoVideoPlayer;
