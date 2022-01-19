import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  Dimensions,
  ScrollView,
  StatusBar,
} from "react-native";
import { Video } from "expo-av";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import themeStyle from "../theme.style";
import useScreenOrientation from "../helpers/hooks/useScreenOrientation";
import ImageWithCache from "./ImageWithCache";
import { Feather } from "@expo/vector-icons";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
const VideoPlayer = ({
  url,
  isFullScreen,
  setShowActions,
  mediaOrientation,
  mediaIsSelfie,
  mediaHeaders,
  shouldPlay,
  showToggle,
  isLocalMedia,
}) => {
  const video = useRef(null);
  const [videoStatus, setVideoStatus] = useState({});
  const [showControls, setShowControls] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [videoDimensions, setVideoDimensions] = useState({});
  const [readyForDisplay, setReadyForDisplay] = useState(false);

  const navigation = useNavigation();
  const progressBarWidth = screenWidth - 170;

  const ScreenOrientation = useScreenOrientation(isFullScreen);

  const handleVideoState = async () => {
    const videoEnded =
      videoStatus.positionMillis &&
      videoStatus.durationMillis &&
      videoStatus.positionMillis === videoStatus.durationMillis;
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    setControlsTimeout(timeout);

    if (videoStatus.isPlaying) {
      await video.current.pauseAsync();
    } else if (videoEnded) {
      await video.current.setPositionAsync(0);
      await video.current.playAsync();
    } else {
      await video.current.playAsync();
    }
  };

  const handleVideoDuration = (duration) => {
    if (!duration) {
      return "";
    }
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${hours > 0 ? `${hours}:` : ""}${minutes}:${seconds}`;
  };

  const handleShowControls = () => {
    setShowControls(!showControls);
    if (setShowActions) {
      setShowActions(!showControls);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      const unsubscribe = navigation.addListener("blur", async () => {
        if (video) {
          await video.current?.pauseAsync();
        }
      });
      isMounted = false;
      return unsubscribe;
    }
  }, [navigation]);

  const handleVideoAspectRatio = () => {
    if (!isFullScreen) {
      return 1;
    }
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <StatusBar animated hidden={isFullScreen} />
        {isFullScreen ? (
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
                  }}
                  volume={1}
                  ref={video}
                  isLooping={false}
                  style={{
                    aspectRatio: handleVideoAspectRatio() || 1,
                    width:
                      ScreenOrientation === "PORTRAIT"
                        ? screenWidth
                        : screenHeight,
                  }}
                  source={{
                    uri: url,
                    headers: mediaHeaders,
                  }}
                  useNativeControls={false}
                  resizeMode="contain"
                  onPlaybackStatusUpdate={(status) => setVideoStatus(status)}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        ) : (
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
                isMuted={!showToggle}
                shouldPlay={shouldPlay || false}
                ref={video}
                isLooping={true}
                style={{
                  aspectRatio: handleVideoAspectRatio() || 1,
                  width:
                    ScreenOrientation === "PORTRAIT"
                      ? screenWidth
                      : screenHeight,
                  // width: videoStatus.isPlaying
                  //   ? ScreenOrientation === "PORTRAIT"
                  //     ? screenWidth
                  //     : screenHeight
                  //   : 0,
                }}
                source={{
                  uri: url,
                  headers: mediaHeaders,
                }}
                useNativeControls={false}
                resizeMode="cover"
                onPlaybackStatusUpdate={(status) => setVideoStatus(status)}
              />
              {(!readyForDisplay || showToggle) && !isLocalMedia ? (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <ImageWithCache
                    removeBorderRadius
                    resizeMode="cover"
                    mediaUrl={url}
                    mediaHeaders={mediaHeaders}
                    aspectRatio={1 / 1}
                  />
                </View>
              ) : null}
              {!showToggle ? (
                <View style={{ position: "absolute", right: 0 }}>
                  <Feather
                    name={videoStatus?.isPlaying ? "pause" : "play"}
                    size={48}
                    color={themeStyle.colors.grayscale.white}
                  />
                </View>
              ) : null}
            </View>
          </View>
        )}
        {!isFullScreen &&
        videoStatus?.durationMillis &&
        videoStatus?.positionMillis ? (
          <Text
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: themeStyle.colors.grayscale.darkGray,
              paddingVertical: 5,
              opacity: 0.8,
              paddingHorizontal: 10,
              borderRadius: 15,
              margin: 10,
              color: themeStyle.colors.grayscale.white,
            }}
          >
            {handleVideoDuration(
              videoStatus?.durationMillis - videoStatus?.positionMillis
            )}
          </Text>
        ) : null}
      </View>
      {showControls || showToggle ? (
        <TouchableWithoutFeedback onPress={() => handleVideoState()}>
          <View
            style={{
              position: "absolute",
            }}
          >
            <Feather
              name={videoStatus.isPlaying ? "pause" : "play"}
              size={48}
              color={themeStyle.colors.grayscale.white}
            />
          </View>
        </TouchableWithoutFeedback>
      ) : null}
      {showControls &&
      isFullScreen &&
      videoStatus?.positionMillis &&
      videoStatus?.durationMillis ? (
        <View style={styles.controls}>
          <Text style={styles.durationStyles}>
            {handleVideoDuration(videoStatus?.positionMillis)}
          </Text>
          <Slider
            style={{ width: progressBarWidth, height: 40 }}
            minimumValue={0}
            value={videoStatus?.positionMillis}
            maximumValue={videoStatus?.durationMillis}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            tapToSeek
            onSlidingComplete={async (value) => {
              await video.current.setPositionAsync(value);
            }}
          />
          <Text style={styles.durationStyles}>
            {handleVideoDuration(videoStatus?.durationMillis)}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

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

export default VideoPlayer;
