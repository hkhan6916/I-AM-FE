import * as ScreenOrientation from "expo-screen-orientation";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Video } from "expo-av";
import { setStatusBarHidden } from "expo-status-bar";
import React, { useRef, useState } from "react";
import VideoPlayer from "expo-video-player";
import useScreenOrientation from "../helpers/hooks/useScreenOrientation";

const App = ({ uri }) => {
  const [inFullscreen, setInFullsreen] = useState(false);
  const [inFullscreen2, setInFullsreen2] = useState(false);
  const refVideo = useRef(null);
  const refVideo2 = useRef(null);
  const refScrollView = useRef(null);
  const ScreenOrientation = useScreenOrientation(true);
  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
  console.log(ScreenOrientation);
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
          ref: refVideo2,
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
