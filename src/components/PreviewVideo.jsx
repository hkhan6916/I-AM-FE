import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Video } from "expo-av";
import themeStyle from "../theme.style";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import AnimatedLottieView from "lottie-react-native";
import useScreenOrientation from "../helpers/hooks/useScreenOrientation";

const PreviewVideo = ({
  uri,
  isFullWidth,
  previewText,
  flipProfileVideo,
  disableBlurListener,
  onLoad,
  isVisible = true,
  isRounded = false,
}) => {
  const { width: screenWidth } = Dimensions.get("window");
  const [videoStatus, setVideoStatus] = useState({});
  const [ready, setReady] = useState(false);
  const profileVideoRef = useRef(null);
  const navigation = useNavigation();
  useScreenOrientation(!!uri && ready); // just forces a re render ONLY when screen rotates. Without this, video does not adjust for landscape viewing.

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

  const handleOnLoad = (v) => {
    if (onLoad) {
      onLoad(v);
    }
  };

  useEffect(() => {
    (async () => {
      if (isVisible === false) {
        await profileVideoRef.current?.pauseAsync();
      }
    })();
  }, [isVisible]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", async () => {
      if (profileVideoRef && !disableBlurListener) {
        await profileVideoRef.current?.unloadAsync();
      }
    });

    return unsubscribe;
  }, [navigation]);
  if (!uri) {
    return (
      <LinearGradient
        start={[0, 0.5]}
        end={[1, 0.5]}
        style={{
          padding: 2,
          width: isFullWidth ? screenWidth : screenWidth / 1.5,
          height: isFullWidth ? screenWidth : (screenWidth * 1.33) / 1.5,
        }}
        colors={[
          ready
            ? themeStyle.colors.primary.default
            : themeStyle.colors.grayscale.highest,
          ready
            ? themeStyle.colors.grayscale.highest
            : themeStyle.colors.grayscale.highest,
          ready
            ? themeStyle.colors.primary.light
            : themeStyle.colors.grayscale.highest,
        ]}
      >
        {Platform.OS !== "web" ? (
          <AnimatedLottieView
            source={require("../../assets/lotties/profileVideo.json")}
            autoPlay={false}
            loop={false}
            progress={0.8}
            style={{ width: "100%", height: "100%", position: "absolute" }}
          />
        ) : null}
      </LinearGradient>
    );
  }
  return (
    <View
      style={{ width: screenWidth, maxWidth: 900, justifyContent: "center" }}
    >
      <LinearGradient
        start={[0, 0.5]}
        end={[1, 0.5]}
        style={[
          {
            padding: 2.5,
            width: (isFullWidth ? screenWidth : screenWidth / 1.5) - 5,
            height:
              (isFullWidth ? screenWidth : (screenWidth * 1.33) / 1.5) - 5,
            alignSelf: "center",
            borderRadius: 5,
          },
          Platform.OS === "web" && { maxWidth: 900, maxHeight: 600 },
        ]}
        colors={[
          ready
            ? themeStyle.colors.primary.default
            : themeStyle.colors.grayscale.highest,
          ready
            ? themeStyle.colors.grayscale.highest
            : themeStyle.colors.grayscale.highest,
          ready
            ? themeStyle.colors.primary.light
            : themeStyle.colors.grayscale.highest,
        ]}
      >
        <TouchableOpacity
          style={[
            { alignSelf: "center" },
            Platform.OS === "web" && {
              width: isFullWidth ? screenWidth : screenWidth / 1.5,
              height: isFullWidth ? screenWidth : (screenWidth * 1.33) / 1.5,
              maxWidth: 900,
              maxHeight: 600,
            },
          ]}
          onPress={() => {
            if (profileVideoRef) {
              videoStatus.isPlaying
                ? profileVideoRef.current.pauseAsync()
                : profileVideoRef.current.playAsync();
            }
          }}
        >
          <Video
            positionMillis={0} // TODO check this on IOS if we should revert to 100ms
            style={[
              {
                alignSelf: "center",
                width: "100%",
                height: "100%",
                borderColor: themeStyle.colors.primary.default,
                borderRadius: isRounded ? 10 : 0,
                aspectRatio: 1,
                transform: [{ scaleX: flipProfileVideo ? -1 : 1 }],
              },
              Platform.OS === "web" && {
                width: screenWidth,
                height: screenWidth,
                maxWidth: 900,
                maxHeight: 600,
                alignItems: "center",
              },
            ]}
            onReadyForDisplay={() => setReady(true)}
            onLoad={(v) => handleOnLoad(v)}
            onPlaybackStatusUpdate={(status) => setVideoStatus(status)}
            progressUpdateIntervalMillis={500}
            ref={profileVideoRef}
            source={{
              uri,
            }}
            // onError={() => {
            //   profileVideoRef?.current?.playAsync(uri);
            //   console.log("error");
            // }}
            isLooping
            resizeMode="cover"
          />
          {!videoStatus.isPlaying ? (
            <View
              style={{
                position: "absolute",
                alignItems: "center",
                justifyContent: "center",
                width: "100%", //isFullWidth ? screenWidth : screenWidth / 1.5,
                height: "100%", //isFullWidth ? screenWidth : (screenWidth * 1.33) / 1.5,
                borderColor: themeStyle.colors.primary.default,
                borderRadius: isFullWidth ? 0 : 10,
                backgroundColor: themeStyle.colors.grayscale.lowest,
                opacity: 0.7,
                padding: 2,
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
                    color: themeStyle.colors.black,
                    opacity: 1,
                    textShadowOffset: {
                      width: 1,
                      height: 1,
                    },
                    textShadowRadius: 9,
                    textShadowColor: "rgba(0,0,0,0.3)",
                  }}
                >
                  {previewText || "Tap to preview"}
                </Text>
              ) : null}
            </View>
          ) : null}
          {!ready && Platform.OS !== "web" ? (
            <AnimatedLottieView
              source={require("../../assets/lotties/profileVideo.json")}
              autoPlay
              loop
              speed={2}
              style={{ width: "100%", height: "100%", position: "absolute" }}
            />
          ) : null}
          {videoStatus?.durationMillis &&
          videoStatus?.positionMillis &&
          ready ? (
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

export default React.memo(
  PreviewVideo,
  (prev, next) => prev.uri === next.uri && prev.isVisible === next.isVisible
);
