import React, { useRef, useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
  BackHandler,
  SafeAreaView,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import { EvilIcons } from "@expo/vector-icons";
import { startActivityAsync, ActivityAction } from "expo-intent-launcher";
import Constants from "expo-constants";
import themeStyle from "../theme.style";
import { StatusBar } from "expo-status-bar";

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
  const [showNotice, setShowNotice] = useState(null);
  const cameraRef = useRef();
  const packageName = Constants.manifest.releaseChannel
    ? Constants.manifest.android.package
    : "com.magnetapp.magnet";

  const openAppSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      startActivityAsync(ActivityAction.APPLICATION_DETAILS_SETTINGS, {
        data: `package:${packageName}`,
      });
    }
  };

  const devices = useCameraDevices();
  const device = devices.front;
  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

  const handleRecordClick = async () => {
    if (recording && recordingLength > 27) {
      const timeout = setTimeout(() => setShowNotice(null), 3000);
      setShowNotice(timeout);
      return;
    }
    if (!recording) {
      setRecordingLength(30);
      setRecording(true);
      await cameraRef?.current?.startRecording({
        onRecordingFinished: (video) => setProfileVideo(video.path),
        onRecordingError: (error) => console.error(error),
      });
    } else {
      await cameraRef?.current?.stopRecording();
      setRecording(false);
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
          cameraRef?.current?.stopRecording();
          setCameraActivated(false);
        }
      }, 1000);
      return () => {
        isMounted = false;
        clearInterval(interval);
        if (showNotice) {
          clearTimeout(showNotice);
        }
      };
    }
  }, [recording]);

  const deactivateCamera = async () => {
    setRecording(async (recording) => {
      if (recording) {
        await cameraRef?.current?.stopRecording();
      }
      return false;
    });
    setCameraActivated(false);
    setRecording(false);
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", deactivateCamera);
    return async () => {
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
          backgroundColor: themeStyle.colors.highest,
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
          Please grant{" "}
          {!hasCameraPermission && !hasAudioPermission
            ? "camera and microphone permissions"
            : !hasAudioPermission
            ? "microphone permissions"
            : !hasCameraPermission
            ? "camera permissions"
            : null}{" "}
          in device settings to create a profile video.
        </Text>
        <View style={{ display: "flex", flexDirection: "row" }}>
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
        backgroundColor: themeStyle.colors.black,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <StatusBar hidden />
      <View
        style={{
          backgroundColor: themeStyle.colors.grayscale.high,
          alignSelf: "flex-end",
          margin: 10,
          paddingVertical: 2,
          paddingHorizontal: 10,
          borderRadius: 50,
          zIndex: 9999,
        }}
      >
        <Text
          style={{
            color:
              recording && recordingLength <= 5
                ? themeStyle.colors.error.default
                : themeStyle.colors.white,
            fontSize: 14,
          }}
        >
          {recording ? `${recordingLength} seconds` : "Ready to record"}
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: "transparent",
          justifyContent: "flex-end",
          zIndex: 999,
          alignItems: "center",
        }}
      >
        {showNotice ? (
          <Text
            style={{
              color: themeStyle.colors.white,
              zIndex: 9999,
              marginBottom: 20,
              padding: 20,
              backgroundColor: "rgba(19,130, 148, 0.2)",
              borderRadius: 10,
              fontWeight: "700",
            }}
          >
            Profile video must be at least 3 seconds long
          </Text>
        ) : null}
        <TouchableWithoutFeedback
          style={{
            alignSelf: "center",
            position: "absolute",
            bottom: 20,
            zIndex: 2,
          }}
          // disabled={recording && recordingLength > 27}
          onPress={() => handleRecordClick()}
        >
          <View
            style={{
              borderWidth: 5,
              borderRadius: 50,
              borderColor:
                recordingLength > 30 - 3
                  ? themeStyle.colors.grayscale.high
                  : themeStyle.colors.white,
              height: 60,
              width: 60,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            {recording ? (
              <View
                style={{
                  borderWidth: 2,
                  borderRadius: 5,
                  borderColor:
                    recordingLength > 30 - 3
                      ? themeStyle.colors.grayscale.high
                      : themeStyle.colors.error.default,
                  height: 25,
                  width: 25,
                  backgroundColor:
                    recordingLength > 30 - 3
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
        </TouchableWithoutFeedback>
      </View>
      <View
        style={{
          position: "absolute",
          zIndex: 1,
          width: "100%",
          backgroundColor: themeStyle.colors.black,
          top: 0,
          height: screenWidth / 2.3,
          opacity: 0.7,
        }}
      />
      <View
        style={{
          position: "absolute",
          zIndex: 1,
          width: "100%",
          backgroundColor: themeStyle.colors.black,
          bottom: 0,
          height: screenWidth / 2.3,
          opacity: 0.7,
        }}
      />
      {device ? (
        <Camera
          audio
          video={true}
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
        />
      ) : null}
    </SafeAreaView>
  );
};

export default ProfileVideoCamera;