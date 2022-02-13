import { Dimensions, StatusBar, View } from "react-native";
import { Video } from "expo-av";
import React, { useEffect, useRef } from "react";
import VideoPlayer from "expo-video-player";
import useScreenOrientation from "../helpers/hooks/useScreenOrientation";

const App = ({ uri }) => {
  const videoRef = useRef(null);
  const ScreenOrientation = useScreenOrientation(true);
  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
  //   useEffect(() => {
  //     (async () => {
  //       if (videoRef) {
  //         videoRef?.current?.setRateAsync(0, true);
  //       }
  //     })();
  //   }, [videoRef]);
  return (
    <View>
      <StatusBar hidden />
      <VideoPlayer
        videoProps={{
          shouldPlay: true,
          resizeMode: Video.RESIZE_MODE_CONTAIN,
          source: {
            uri: uri,
          },
          ref: videoRef,
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

export default App;
