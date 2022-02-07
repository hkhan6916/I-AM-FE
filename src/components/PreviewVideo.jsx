import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Video } from "expo-av";
import themeStyle from "../theme.style";
import { LinearGradient } from "expo-linear-gradient";

const PreviewVideo = ({ uri, headers, isFullWidth, previewText }) => {
  const { width: screenWidth } = Dimensions.get("window");
  const [videoStatus, setVideoStatus] = useState({});

  const profileVideoRef = useRef(null);

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
    <View>
      <LinearGradient
        start={[0, 0.5]}
        end={[1, 0.5]}
        style={{ padding: 4 }}
        colors={[
          themeStyle.colors.grayscale.white,
          themeStyle.colors.primary.light,
        ]}
      >
        <TouchableOpacity
          style={{
            alignSelf: "center",
          }}
          onPress={() =>
            videoStatus.isPlaying
              ? profileVideoRef.current.pauseAsync()
              : profileVideoRef.current.playAsync()
          }
        >
          <Video
            style={{
              transform: [{ scaleX: -1 }],
              alignSelf: "center",
              width: isFullWidth ? screenWidth : screenWidth / 1.5,
              height: isFullWidth ? screenWidth : (screenWidth * 1.33) / 1.5,
              borderColor: themeStyle.colors.primary.default,
              borderRadius: isFullWidth ? 0 : 10,
            }}
            onPlaybackStatusUpdate={(status) => setVideoStatus(status)}
            ref={profileVideoRef}
            source={{
              uri,
              headers,
            }}
            isLooping
            resizeMode="cover"
          />
          {!videoStatus.isPlaying ? (
            <View
              style={{
                position: "absolute",
                alignItems: "center",
                justifyContent: "center",
                width: isFullWidth ? screenWidth : screenWidth / 1.5,
                height: isFullWidth ? screenWidth : (screenWidth * 1.33) / 1.5,
                borderColor: themeStyle.colors.primary.default,
                borderRadius: isFullWidth ? 0 : 10,
                backgroundColor: themeStyle.colors.grayscale.black,
                opacity: 0.5,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  position: "absolute",
                  fontSize: 20,
                  textAlign: "center",
                  width: screenWidth,
                  color: themeStyle.colors.grayscale.white,
                }}
              >
                {previewText || "Tap to preview"}
              </Text>
            </View>
          ) : null}
          {videoStatus?.durationMillis && videoStatus?.positionMillis ? (
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
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

export default React.memo(PreviewVideo);
