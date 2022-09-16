import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Video } from "expo-av";
import themeStyle from "../theme.style";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import CardImage from "./CardImage";
import { useSelector } from "react-redux";
const VideoPlayer = ({
  url,
  shouldPlay,
  showToggle,
  thumbnailUrl,
  thumbnailHeaders,
  isUploading,
  isCancelled,
  preventPlay,
  screenWidth = 400,
  screenHeight = 600,
  height,
  width,
  disableVideo,
  setUnMuteVideos,
}) => {
  const calculatedVideoHeight =
    height && width && (Number(height) / Number(width)) * screenWidth;
  const globalUnMuteVideos = useSelector(
    (state) => state.globalUnMuteVideos
  )?.state;
  const decidedHeight =
    calculatedVideoHeight < screenHeight / 1.4
      ? calculatedVideoHeight
      : screenHeight / 1.4;

  const video = useRef(null);
  const [videoStatus, setVideoStatus] = useState({});
  // const [videoDimensions, setVideoDimensions] = useState({});
  const [readyForDisplay, setReadyForDisplay] = useState(false);

  // const navigation = useNavigation();
  const handleVideoDuration = (duration) => {
    if (!duration) {
      return "";
    }
    let seconds = Math.floor(duration % 60);
    let minutes = Math.floor((duration / 60) % 60);
    let hours = Math.floor((duration / (60 * 60)) % 24);

    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${hours > 0 ? `${hours}:` : ""}${minutes}:${seconds}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View
        style={[
          {
            // aspectRatio: aspectRatio || 1,
            height: decidedHeight,
            width: Math.min(screenWidth, screenHeight), // math.min needed for when user switches back from landscape
          },
          (!height || !width) && {
            width: screenWidth,
            height: "100%",
            aspectRatio: 1 / 1,
          },
        ]}
      >
        {isUploading || isCancelled ? (
          <Text
            style={{
              position: "absolute",
              fontSize: 20,
              color: themeStyle.colors.white,
              zIndex: 1,
              textAlign: "center",
              margin: 10,
              textShadowOffset: {
                width: 1,
                height: 1,
              },
              textShadowRadius: 8,
              textShadowColor: themeStyle.colors.black,
            }}
          >
            {isCancelled ? "Upload Cancelled" : "Uploading..."}
          </Text>
        ) : null}
        <View style={{ backgroundColor: themeStyle.colors.black }}>
          {isUploading || isCancelled || preventPlay || disableVideo ? (
            <CardImage
              mediaHeaders={thumbnailHeaders}
              mediaUrl={thumbnailUrl}
              screenWidth={screenWidth}
              screenHeight={screenHeight}
              height={height}
              width={width}
            />
          ) : null}
          {!isUploading && !isCancelled && !preventPlay && !disableVideo ? (
            <Video
              onReadyForDisplay={() => setReadyForDisplay(true)}
              isLooping={true}
              shouldPlay={shouldPlay}
              usePoster
              isMuted={!globalUnMuteVideos}
              ref={video}
              posterSource={{ uri: thumbnailUrl, headers: thumbnailHeaders }}
              posterStyle={[
                {
                  width: screenWidth,
                  height: decidedHeight,
                  backgroundColor: themeStyle.colors.black,
                },
                (!height || !width) && {
                  width: screenWidth,
                  height: screenWidth,
                  aspectRatio: 1 / 1,
                },
              ]}
              // playInBackground={false}
              style={[
                {
                  height: decidedHeight,
                  width: Math.min(screenWidth, screenHeight), // math.min needed for when user switches back from landscape
                },
                (!height || !width) && {
                  width: screenWidth,
                  height: "100%",
                  aspectRatio: 1 / 1,
                },
              ]}
              source={{
                uri: url,
              }}
              useNativeControls={false}
              resizeMode="contain"
              // onProgress={(status) => setVideoStatus(status)}
              onPlaybackStatusUpdate={(status) => {
                setVideoStatus(status);
                setReadyForDisplay(status.isLoaded);
              }}
            />
          ) : null}
          {/* ) : null} */}

          {(!showToggle && !readyForDisplay) || disableVideo || !shouldPlay ? (
            <View
              style={{
                position: "absolute",
                right: "0%",
                top: "0%",
                left: "0%",
                bottom: "0%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  padding: 10,
                  paddingLeft: 14,
                  paddingRight: 6,
                  borderWidth: 3,
                  borderColor: themeStyle.colors.white,
                  borderRadius: 50,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather
                  name={shouldPlay && readyForDisplay ? "pause" : "play"}
                  size={48}
                  color={themeStyle.colors.white}
                  style={{
                    color: themeStyle.colors.white,
                    textShadowOffset: {
                      width: 1,
                      height: 1,
                    },
                    textShadowRadius: 20,
                    textShadowColor: themeStyle.colors.black,
                  }}
                />
              </View>
            </View>
          ) : null}

          <View
            style={{
              position: "absolute",
              display: disableVideo ? "none" : "flex",
              right: 0,
              bottom: 0,
            }}
          >
            <TouchableOpacity
              onPress={() => setUnMuteVideos(!globalUnMuteVideos)}
              style={{
                height: 48,
                width: 48,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={
                  !globalUnMuteVideos ? "ios-volume-mute" : "ios-volume-medium"
                }
                style={{
                  color: themeStyle.colors.white,
                  textShadowOffset: {
                    width: 1,
                    height: 1,
                  },
                  textShadowRadius: 8,
                  textShadowColor: themeStyle.colors.black,
                }}
                size={24}
                color={themeStyle.colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {videoStatus?.playableDuration && videoStatus?.currentTime ? (
        <Text
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            backgroundColor: themeStyle.colors.grayscale.higher,
            paddingVertical: 5,
            opacity: 0.8,
            paddingHorizontal: 10,
            borderRadius: 15,
            margin: 10,
            color: themeStyle.colors.grayscale.lowest,
          }}
        >
          {handleVideoDuration(
            videoStatus?.playableDuration - videoStatus?.currentTime
          )}
        </Text>
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
    color: themeStyle.colors.grayscale.lowest,
  },
});

export default React.memo(
  VideoPlayer,
  (prevProps, nextProps) =>
    prevProps.url === nextProps.url &&
    prevProps.shouldPlay === nextProps.shouldPlay &&
    prevProps.unMute === nextProps.unMute
);
