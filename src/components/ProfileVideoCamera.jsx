import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
  BackHandler,
  SafeAreaView,
} from "react-native";
import { Camera } from "expo-camera";
import { Ionicons, EvilIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { startActivityAsync, ActivityAction } from "expo-intent-launcher";
import Constants from "expo-constants";
import themeStyle from "../theme.style";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
const ProfileVideoCamera = ({
  recording,
  setRecording,
  setProfileVideo,
  setCameraActivated,
  recordingLength,
  setRecordingLength,
  hasCameraPermission,
  hasAudioPermission,
}) => {
  const [cameraRef, setCameraRef] = useState(null);
  const navigation = useNavigation();

  const packageName = Constants.manifest.releaseChannel
    ? Constants.manifest.android.package
    : "host.exp.exponent";

  const openAppSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      startActivityAsync(ActivityAction.APPLICATION_DETAILS_SETTINGS, {
        data: `package:${packageName}`,
      });
    }
  };

  const handleRecordClick = async () => {
    if (!recording) {
      setRecordingLength(15);
      setRecording(true);
      setTimeout(async () => {
        const video = await cameraRef.recordAsync({
          quality: Camera.Constants.VideoQuality["720p"],
          mirror: false,
        });
        setProfileVideo(video.uri);
      }, 500);
    } else {
      setRecording(false);
      cameraRef.stopRecording();
      setCameraActivated(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      let length = recordingLength;
      const interval = setInterval(() => {
        if (recording && length > 0) {
          length -= 1;
          setRecordingLength(length);
        }

        if (recording && length === 0) {
          setRecording(false);
          cameraRef.stopRecording();
          setCameraActivated(false);
        }
      }, 1000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [recording]);

  const deactivateCamera = () => {
    setCameraActivated(false);
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", deactivateCamera);
    return () => {
      setRecording(false);
      setCameraActivated(false);
      setCameraRef(null);
      BackHandler.removeEventListener("hardwareBackPress", deactivateCamera);
    };
  }, []);
  if (hasCameraPermission === null || hasAudioPermission === null) {
    return <View />;
  }
  if (hasCameraPermission === false || hasAudioPermission === false) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: themeStyle.colors.primary.default,
        }}
      >
        <View
          style={{
            borderColor: themeStyle.colors.grayscale.lowest,
            borderWidth: 3,
            padding: 20,
            width: 150,
            height: 150,
            borderRadius: 200,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <EvilIcons
            name="camera"
            size={104}
            color={themeStyle.colors.grayscale.lowest}
          />
        </View>
        <Text
          style={{
            margin: 20,
            textAlign: "center",
            color: themeStyle.colors.grayscale.lowest,
          }}
        >
          Well...? No worries, this should be easy. Please enable{" "}
          {!hasCameraPermission && !hasAudioPermission
            ? "camera and microphone permissions"
            : !hasAudioPermission
            ? "microphone permission"
            : !hasCameraPermission
            ? "camera permission"
            : null}{" "}
          in device settings. That way you can post cool photos and videos!
        </Text>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                margin: 10,
                padding: 5,
                borderRadius: 5,
                borderWidth: 2,
                borderColor: themeStyle.colors.grayscale.lowest,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: themeStyle.colors.grayscale.lowest,
                  fontWeight: "700",
                }}
              >
                Go to Home{" "}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openAppSettings()}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                margin: 10,
                padding: 5,
                borderRadius: 5,
                borderWidth: 2,
                borderColor: themeStyle.colors.grayscale.lowest,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: themeStyle.colors.grayscale.lowest,
                  fontWeight: "700",
                }}
              >
                Go to Settings{" "}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: themeStyle.colors.grayscale.highest,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View>
        <TouchableOpacity
          onPress={() => setCameraActivated(false)}
          style={{
            height: 48,
            width: 48,
            margin: 15,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={themeStyle.colors.grayscale.lowest}
            />
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                marginLeft: 10,
              }}
            >
              Back
            </Text>
          </View>
        </TouchableOpacity>
        <Camera
          style={{
            width: screenWidth,
            height: screenWidth * 1.33,
            marginTop: (screenHeight - screenWidth * 1.33) / 2,
            marginBottom: (screenHeight - screenWidth * 1.33) / 2,
          }}
          ratio="4:3"
          type={Camera.Constants.Type.front}
          ref={(ref) => {
            setCameraRef(ref);
          }}
        >
          <View
            style={{
              backgroundColor: themeStyle.colors.grayscale.high,
              alignSelf: "flex-end",
              margin: 10,
              paddingVertical: 2,
              paddingHorizontal: 10,
              borderRadius: 50,
            }}
          >
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                fontSize: 14,
              }}
            >
              {recordingLength} seconds
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "transparent",
              justifyContent: "flex-end",
            }}
          >
            {/* <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          > */}
            <TouchableOpacity
              style={{
                alignSelf: "center",
                width: 50,
                position: "absolute",
                bottom: 20,
              }}
              onPress={() => handleRecordClick()}
            >
              <View
                style={{
                  borderWidth: 5,
                  borderRadius: 50,
                  borderColor:
                    recordingLength > 15 - 3
                      ? themeStyle.colors.grayscale.high
                      : themeStyle.colors.grayscale.lowest,
                  height: 60,
                  width: 60,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {recording ? (
                  <View
                    style={{
                      borderWidth: 2,
                      borderRadius: 5,
                      borderColor:
                        recordingLength > 15 - 3
                          ? themeStyle.colors.grayscale.high
                          : themeStyle.colors.error.default,
                      height: 25,
                      width: 25,
                      backgroundColor:
                        recordingLength > 15 - 3
                          ? themeStyle.colors.grayscale.high
                          : themeStyle.colors.error.default,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      borderWidth: 2,
                      borderRadius: 70,
                      borderColor: themeStyle.colors.error.default,
                      height: 50,
                      width: 50,
                      backgroundColor: themeStyle.colors.error.default,
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
          {/* </View> */}
        </Camera>
      </View>
    </SafeAreaView>
  );
};

export default ProfileVideoCamera;
