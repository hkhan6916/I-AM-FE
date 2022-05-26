import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, Text, Dimensions, ScrollView } from "react-native";
import { Video } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import themeStyle from "../theme.style";
import ImageWithCache from "./ImageWithCache";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import CardImage from "./CardImage";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const VideoPlayer = ({
  url,
  isFullScreen,
  setShowActions,
  mediaIsSelfie,
  // mediaHeaders,
  shouldPlay,
  isMuted,
  showToggle,
  thumbnailUrl,
  thumbnailHeaders,
  isUploading,
  isCancelled,
  preventPlay,
  screenWidth,
  screenHeight,
  height,
  width,
}) => {
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

  const aspectRatio = 1 / 1;

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
        <View>
          {!readyForDisplay || isUploading || isCancelled || preventPlay ? (
            <View
              style={{
                position: !preventPlay || shouldPlay ? "absolute" : "relative",
                top: 0,
                width: "100%",
                height: "100%",
              }}
            >
              {/* <ImageWithCache // MAYBE have all videos square?
                removeBorderRadius
                resizeMode="cover"
                mediaUrl={thumbnailUrl}
                mediaHeaders={thumbnailHeaders}
                aspectRatio={1 / 1}
                mediaIsSelfie={mediaIsSelfie}
              /> */}
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
              isMuted={!showToggle || isMuted}
              shouldPlay={!!shouldPlay}
              ref={video}
              isLooping={true}
              style={{
                aspectRatio: aspectRatio || 1,
                width: Math.min(screenWidth, screenHeight), // math.min needed for when user switches back from landscape
              }}
              source={{
                uri: url,
              }}
              useNativeControls={false}
              resizeMode="cover"
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
          ) : isMuted ? (
            <View style={{ position: "absolute", right: 10, top: 10 }}>
              <Ionicons
                name="ios-volume-mute-outline"
                size={24}
                color={themeStyle.colors.black}
              />
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
