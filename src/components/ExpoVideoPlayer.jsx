import { Dimensions, Platform, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import VideoPlayer from "expo-video-player";
import useScreenOrientation from "../helpers/hooks/useScreenOrientation";
import { useNavigation } from "@react-navigation/native";
import { Video } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";

const ExpoVideoPlayer = ({
  uri,
  isSelfie,
  enableIOSNativeControls = false,
}) => {
  const [focussed, setFocussed] = useState(true);

  useScreenOrientation(true); // just forces a re render ONLY when screen rotates. Without this, video does not adjust for landscape viewing.
  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

  const videoRef = useRef();
  const navigation = useNavigation();

  const videoProps = {
    ref: videoRef,
    shouldPlay: true,
    resizeMode: "contain",
    source: {
      uri: uri,
    },
    useNativeControls: false,
    style: {
      transform: [{ scaleX: isSelfie ? -1 : 1 }],
      height: "100%",
    },
  };

  useEffect(() => {
    (async () => {
      navigation.addListener("focus", async () => {
        setFocussed(true);
      });
      navigation.addListener("blur", async () => {
        setFocussed(false);
      });
    })();
    return async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
      navigation.removeListener("focus");
      navigation.removeListener("blur");
    };
  }, []);

  if (!focussed) return null;

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      {(!enableIOSNativeControls && Platform.OS === "ios") ||
      Platform.OS !== "ios" ? (
        <VideoPlayer
          autoHidePlayer={false}
          timeVisible
          style={{
            height:
              Platform.OS === "android" ? screenHeight : screenHeight - 100,
          }}
          slider={{ height: Platform.OS === "android" ? 100 : 0 }}
          videoProps={videoProps}
          fullscreen
        />
      ) : (
        <Video
          {...videoProps}
          useNativeControls
          style={{
            width: screenWidth,
            flex: 1,
          }}
        />
      )}
    </View>
  );
};

export default React.memo(ExpoVideoPlayer);
