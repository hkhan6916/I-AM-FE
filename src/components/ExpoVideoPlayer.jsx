import { Dimensions, StatusBar, View } from "react-native";
import { Video } from "expo-av";
import React from "react";
import VideoPlayer from "expo-video-player";

const ExpoVideoPlayer = ({ uri }) => {
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
