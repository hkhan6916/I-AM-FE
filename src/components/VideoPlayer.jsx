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

const VideoPlayer = ({
  url,
  shouldPlay,
  isMuted,
  showToggle,
  thumbnailUrl,
  thumbnailHeaders,
  isUploading,
  isCancelled,
  preventPlay,
  screenWidth = 300,
  screenHeight = 300,
  height,
  width,
}) => {
  const [unMute, setUnMute] = useState(false);

  const calculatedVideoHeight =
    height && width && (Number(height) / Number(width)) * screenWidth;

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
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${hours > 0 ? `${hours}:` : ""}${minutes}:${seconds}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        {isUploading || isCancelled ? (
          <Text
            style={{
              position: "absolute",
              fontSize: 20,
              color: themeStyle.colors.grayscale.low,
              zIndex: 1,
              textAlign: "center",
              margin: 10,
            }}
          >
            {isCancelled ? "Upload Cancelled" : "Uploading..."}
          </Text>
        ) : null}
        <View style={{ backgroundColor: themeStyle.colors.black }}>
          {!readyForDisplay || isUploading || isCancelled || preventPlay ? (
            <View
              style={{
                position: !preventPlay || shouldPlay ? "absolute" : "relative",
                top: 0,
                width: "100%",
                height: "100%",
              }}
            >
              <CardImage
                mediaHeaders={thumbnailHeaders}
                mediaUrl={thumbnailUrl}
                screenWidth={screenWidth}
                screenHeight={screenHeight}
                height={height}
                width={width}
              />
            </View>
          ) : null}
          {!preventPlay || shouldPlay ? (
            <Video
              onReadyForDisplay={(params) => {
                // setVideoDimensions(params.naturalSize);
                setReadyForDisplay(true);
              }}
              isMuted={(!showToggle || isMuted) && !unMute}
              shouldPlay={!!shouldPlay}
              ref={video}
              isLooping={true}
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
              source={{
                uri: url,
              }}
              useNativeControls={false}
              resizeMode="contain"
              onPlaybackStatusUpdate={(status) => setVideoStatus(status)}
            />
          ) : null}
          {!showToggle ? (
            <View style={{ position: "absolute", right: 0 }}>
              <Feather
                name={shouldPlay ? "pause" : "play"}
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
          ) : isMuted || unMute ? (
            <View style={{ position: "absolute", right: 10, top: 10 }}>
              <TouchableOpacity onPress={() => setUnMute(!unMute)}>
                <Ionicons
                  name={!unMute ? "ios-volume-mute" : "ios-volume-medium"}
                  size={24}
                  color={themeStyle.colors.white}
                />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
      {videoStatus?.durationMillis && videoStatus?.positionMillis ? (
        <Text
          style={{
            position: "absolute",
            bottom: 0,
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
            videoStatus?.durationMillis - videoStatus?.positionMillis
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
    prevProps.shouldPlay === nextProps.shouldPlay
);
