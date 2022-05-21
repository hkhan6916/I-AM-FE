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
import { Octicons } from "@expo/vector-icons";

const PreviewVideo = ({ uri, isFullWidth, previewText, flipProfileVideo }) => {
  const { width: screenWidth } = Dimensions.get("window");
  const [videoStatus, setVideoStatus] = useState({});
  const [ready, setReady] = useState(false);
  const profileVideoRef = useRef(null);
  const navigation = useNavigation();
  useScreenOrientation(!!uri); // just forces a re render ONLY when screen rotates. Without this, video does not adjust for landscape viewing.

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
        <AnimatedLottieView
          source={require("../../assets/lotties/profileVideo.json")}
          autoPlay={false}
          loop={false}
          progress={0.8}
          style={{ width: "100%", height: "100%", position: "absolute" }}
        />
      </LinearGradient>
    );
  }
  return (
    <View>
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
            positionMillis={100}
            style={[
              {
                alignSelf: "center",
                width: "100%",
                height: "100%",
                borderColor: themeStyle.colors.primary.default,
                borderRadius: isFullWidth ? 0 : 10,
                aspectRatio: 1,
                transform: [{ scaleX: flipProfileVideo ? -1 : 1 }],
              },
            ]}
            onReadyForDisplay={() => setReady(true)}
            onPlaybackStatusUpdate={(status) => setVideoStatus(status)}
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
                    color: themeStyle.colors.primary.light,
                    opacity: 0.7,
                  }}
                >
                  {previewText || "Tap to preview"}
                </Text>
              ) : null}
            </View>
          ) : null}
          {!ready ? (
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

export default React.memo(PreviewVideo, (prev, next) => prev.uri === next.uri);
