import React, { useRef, useState, useEffect } from "react";
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
const VideoPlayer = ({
  url,
  isFullScreen,
  setShowActions,
  mediaOrientation,
  mediaIsSelfie,
  // mediaHeaders,
  shouldPlay,
  showToggle,
  isLocalMedia,
}) => {
  console.log({ shouldPlay });
  const video = useRef(null);
  const [videoStatus, setVideoStatus] = useState({});
  const [showControls, setShowControls] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [videoDimensions, setVideoDimensions] = useState({});
  const [readyForDisplay, setReadyForDisplay] = useState(false);
  const [autoHideControls, setAutoHideControls] = useState(false);
  const navigation = useNavigation();
  const progressBarWidth = screenWidth - 170;

  const ScreenOrientation = useScreenOrientation(isFullScreen);

  const handleVideoState = async () => {
    const videoEnded =
      videoStatus.positionMillis &&
      videoStatus.durationMillis &&
      videoStatus.positionMillis === videoStatus.durationMillis;
    setAutoHideControls(true);

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

  const aspectRatio = handleVideoAspectRatio();

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
                    setReadyForDisplay(true);
                  }}
                  volume={1}
                  ref={video}
                  isLooping={false}
                  style={{
                    aspectRatio: aspectRatio || 1,
                    width:
                      ScreenOrientation === "PORTRAIT"
                        ? screenWidth
                        : screenHeight,
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
                  aspectRatio: aspectRatio || 1,
                  width:
                    ScreenOrientation === "PORTRAIT"
                      ? screenWidth
                      : screenHeight,
                }}
                source={{
                  uri: url,
                  // headers: mediaHeaders,
                }}
                useNativeControls={false}
                resizeMode="cover"
                onPlaybackStatusUpdate={(status) => setVideoStatus(status)}
              />
              {(!readyForDisplay || showToggle) &&
              !videoStatus.isPlaying &&
              !isLocalMedia &&
              !isFullScreen ? (
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
                    // mediaHeaders={mediaHeaders}
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

export default React.memo(
  VideoPlayer,
  (prevProps, nextProps) =>
    prevProps.url === nextProps.url ||
    prevProps.shouldPlay === nextProps.shouldPlay
);
