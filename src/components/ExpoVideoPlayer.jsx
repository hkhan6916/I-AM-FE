import { Dimensions, Platform, View } from "react-native";
import React, { useCallback, useRef } from "react";
import VideoPlayer from "expo-video-player";
import useScreenOrientation from "../helpers/hooks/useScreenOrientation";
import { useFocusEffect } from "@react-navigation/native";

const ExpoVideoPlayer = ({ uri, isSelfie }) => {
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
    <View style={{ flex: 1, justifyContent: "center" }}>
      <VideoPlayer
        autoHidePlayer={false}
        timeVisible
        style={{
          height: Platform.OS === "android" ? screenHeight : screenHeight - 100,
        }}
        slider={{ height: Platform.OS === "android" ? 100 : 0 }}
        videoProps={{
          ref: videoRef,
          shouldPlay: true,
          resizeMode: "contain",
          source: {
            uri: uri,
          },
          style: {
            transform: [{ scaleX: isSelfie ? -1 : 1 }],
            height: "100%",
          },
        }}
        fullscreen
      />
    </View>
  );
};

export default React.memo(ExpoVideoPlayer);
