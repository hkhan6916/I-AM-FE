import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Video } from "expo-av";
import themeStyle from "../theme.style";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";

const PreviewVideo = ({ uri, isFullWidth, previewText }) => {
  const { width: screenWidth } = Dimensions.get("window");
  const [videoStatus, setVideoStatus] = useState({});
  const [ready, setReady] = useState(false);

  const profileVideoRef = useRef(null);
  const navigation = useNavigation();

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

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      const unsubscribe = navigation.addListener("blur", async () => {
        if (profileVideoRef) {
          await profileVideoRef.current?.pauseAsync();
        }
      });
      isMounted = false;
      return unsubscribe;
    }
  }, [navigation]);

  return (
    <View>
      <LinearGradient
        start={[0, 0.5]}
        end={[1, 0.5]}
        style={{ padding: 4 }}
        colors={[
          themeStyle.colors.grayscale.highest,
          themeStyle.colors.primary.light,
        ]}
      >
        <TouchableOpacity
          style={{
            alignSelf: "center",
          }}
          onPress={() => {
            if (profileVideoRef) {
              videoStatus.isPlaying
                ? profileVideoRef.current.pauseAsync()
                : profileVideoRef.current.playAsync();
            }
          }}
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
            onReadyForDisplay={() => setReady(true)}
            onPlaybackStatusUpdate={(status) => setVideoStatus(status)}
            ref={profileVideoRef}
            source={{
              uri,
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
                backgroundColor: themeStyle.colors.grayscale.lowest,
                opacity: 0.5,
              }}
            >
              {ready ? (
                <Text
                  style={{
                    flex: 1,
                    position: "absolute",
                    fontSize: 20,
                    textAlign: "center",
                    width: screenWidth,
                    color: themeStyle.colors.grayscale.lowest,
                  }}
                >
                  {previewText || "Tap to preview"}
                </Text>
              ) : null}
            </View>
          ) : null}
          {!ready ? (
            <LottieView
              source={require("../../assets/lotties/profileVideo.json")}
              autoPlay
              loop
              speed={2}
              style={{ width: "100%", height: "100%", position: "absolute" }}
            />
          ) : null}
          {videoStatus?.durationMillis && videoStatus?.positionMillis ? (
            <View
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
              }}
            >
              <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                {handleVideoDuration(
                  videoStatus?.durationMillis - videoStatus?.positionMillis
                )}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

export default React.memo(PreviewVideo);
