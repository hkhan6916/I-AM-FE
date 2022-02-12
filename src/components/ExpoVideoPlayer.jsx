import { Dimensions, StatusBar, StyleSheet, View } from "react-native";
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
          width: ScreenOrientation === "PORTRAIT" ? screenWidth : screenWidth,
          height:
            ScreenOrientation === "PORTRAIT" ? screenHeight : screenHeight,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    flex: 1,
  },
  contentContainer: {},
  text: {},
});

export default App;
