import React, { useRef, useState, useEffect, forwardRef } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  Dimensions,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Video } from "expo-av";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import themeStyle from "../theme.style";
import useScreenOrientation from "../helpers/hooks/useScreenOrientation";
import ImageWithCache from "./ImageWithCache";
import { Feather } from "@expo/vector-icons";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
const FullScreenVideo = forwardRef(
  (
    {
      url,
      setShowActions,
      mediaOrientation,
      mediaIsSelfie,
      isFullScreen,
      // mediaHeaders,
      shouldPlay,
      showToggle,
      isLocalMedia,
      handleShowControls,
    },
    ref
  ) => {
    const video = useRef(null);
    const [videoStatus, setVideoStatus] = useState({});
    const [showControls, setShowControls] = useState(false);
    const [controlsTimeout, setControlsTimeout] = useState(null);
    const [videoDimensions, setVideoDimensions] = useState({});
    const [readyForDisplay, setReadyForDisplay] = useState(false);
    const [autoHideControls, setAutoHideControls] = useState(false);
    const navigation = useNavigation();
    const progressBarWidth = screenWidth - 170;

    const ScreenOrientation = useScreenOrientation(true);

    const handleVideoAspectRatio = () => {
      if (ScreenOrientation === "LANDSCAPE") {
        let aspectRatio = videoDimensions.height / videoDimensions.width;
        if (
          mediaOrientation === "landscape-left" ||
          mediaOrientation === "landscape-right"
        ) {
          aspectRatio = videoDimensions.width / videoDimensions.width;
        }
        return aspectRatio;
      }
      return videoDimensions.width / videoDimensions.height;
    };

    const aspectRatio = handleVideoAspectRatio();

    useEffect(() => {
      let isMounted = true;
      if (isMounted) {
        if (autoHideControls) {
          setAutoHideControls(false);

          if (controlsTimeout) {
            clearTimeout(controlsTimeout);
          }
          if (!controlsTimeout) {
            const timeout = setTimeout(() => {
              setShowControls(false);
            }, 500);
            setControlsTimeout(timeout);
          }
        }
        return () => {
          isMounted = false;
          if (controlsTimeout) {
            clearTimeout(controlsTimeout);
          }
        };
      }
    }, [autoHideControls]);

    return (
      <TouchableWithoutFeedback onPress={() => handleShowControls()}>
        <View
          style={{
            transform: [{ scaleX: mediaIsSelfie ? -1 : 1 }],
          }}
        >
          <View
            style={{
              transform: [
                {
                  rotate:
                    mediaOrientation === "landscape-left"
                      ? "-90deg"
                      : mediaOrientation === "landscape-right"
                      ? "90deg"
                      : "0deg",
                },
              ],
            }}
          >
            <Video
              onReadyForDisplay={(params) => {
                setVideoDimensions(params.naturalSize);
                setReadyForDisplay(true);
              }}
              volume={1}
              ref={ref}
              isLooping={false}
              style={{
                aspectRatio: aspectRatio || 1,
                width:
                  ScreenOrientation === "PORTRAIT" ? screenWidth : screenHeight,
              }}
              source={{
                uri: url,
                // headers: mediaHeaders,
              }}
              useNativeControls={false}
              resizeMode="contain"
              onPlaybackStatusUpdate={(status) => setVideoStatus(status)}
            />
          </View>
          {!readyForDisplay ? (
            <View
              style={{
                alignSelf: "center",
                position: "absolute",
                top: "50%",
              }}
            >
              <ActivityIndicator
                size={"large"}
                color={themeStyle.colors.secondary.bright}
                animating
              />
            </View>
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    );
  }
);

FullScreenVideo.displayName = "FullscreenVideo";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttons: {
    marginTop: 200,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  controls: {
    height: 48,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    width: "100%",
  },
  durationStyles: {
    fontWeight: "500",
    color: themeStyle.colors.grayscale.white,
  },
});

export default FullScreenVideo;
