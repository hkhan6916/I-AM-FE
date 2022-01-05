import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  BackHandler,
  Linking,
  Platform,
} from "react-native";

import { Camera } from "expo-camera";
import { EvilIcons, Ionicons } from "@expo/vector-icons";
import * as FaceDetector from "expo-face-detector";
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
  handleFacesDetected,
}) => {
  const [cameraRef, setCameraRef] = useState(null);

  const [type, setType] = useState(Camera.Constants.Type.front);

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
    return () => clearInterval(interval);
  }, [recording]);
  const deactivateCamera = () => {
    setCameraActivated(false);
    return true;
  };
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", deactivateCamera);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", deactivateCamera);
    };
  }, []);

  const cameraHeight = screenWidth * 1.33;
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
            borderColor: themeStyle.colors.grayscale.white,
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
            color={themeStyle.colors.grayscale.white}
          />
        </View>
        <Text
          style={{
            margin: 20,
            textAlign: "center",
            color: themeStyle.colors.grayscale.white,
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
          in device settings.
        </Text>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <TouchableOpacity onPress={() => deactivateCamera()}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                margin: 10,
                padding: 5,
                borderRadius: 5,
                borderWidth: 2,
                borderColor: themeStyle.colors.grayscale.white,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: themeStyle.colors.grayscale.white,
                  fontWeight: "700",
                }}
              >
                Go back{" "}
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
                borderColor: themeStyle.colors.grayscale.white,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: themeStyle.colors.grayscale.white,
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
    <View style={styles.container}>
      {hasCameraPermission && hasAudioPermission ? (
        <View>
          <Camera
            mirror
            style={{
              width: screenWidth,
              height: cameraHeight,
              marginTop: (screenHeight - cameraHeight) / 2.5,
              marginBottom: (screenHeight - cameraHeight) / 1.5,
            }}
            ratio="4:3"
            type={type}
            ref={(ref) => {
              setCameraRef(ref);
            }}
            onFacesDetected={(e) => handleFacesDetected(e)}
            faceDetectorSettings={{
              mode: FaceDetector.FaceDetectorMode.fast,
              detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
              runClassifications: FaceDetector.FaceDetectorClassifications.none,
              minDetectionInterval: 100,
              tracking: true,
            }}
          >
            <View style={styles.cameraBottomSection}>
              <Text>{recordingLength}</Text>
              <View style={styles.controlsContainer}>
                <View
                  style={{
                    flex: 0.3,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      width: 50,
                      height: 50,
                    }}
                    onPress={() => {
                      setType(
                        type === Camera.Constants.Type.back
                          ? Camera.Constants.Type.front
                          : Camera.Constants.Type.back
                      );
                    }}
                  >
                    <Ionicons
                      name="camera-reverse-outline"
                      size={40}
                      color={themeStyle.colors.grayscale.white}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flex: 0.5,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      width: 50,
                      height: 50,
                    }}
                    disabled={recording && recordingLength > 12}
                    onPress={() => handleRecordClick()}
                  >
                    <View
                      style={{
                        borderWidth: 2,
                        borderRadius: 25,
                        borderColor:
                          recording && recordingLength > 12
                            ? themeStyle.colors.grayscale.mediumGray
                            : themeStyle.colors.error.default,
                        height: 50,
                        width: 50,
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
                              recordingLength > 12
                                ? themeStyle.colors.grayscale.mediumGray
                                : themeStyle.colors.error.default,
                            height: 25,
                            width: 25,
                            backgroundColor:
                              recordingLength > 12
                                ? themeStyle.colors.grayscale.mediumGray
                                : themeStyle.colors.error.default,
                          }}
                        />
                      ) : (
                        <View
                          style={{
                            borderWidth: 2,
                            borderRadius: 25,
                            borderColor: themeStyle.colors.error.default,
                            height: 40,
                            width: 40,
                            backgroundColor: themeStyle.colors.error.default,
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Camera>
          <TouchableOpacity
            style={{
              position: "absolute",
              right: 20,
              top: 20,
            }}
            onPress={() => deactivateCamera()}
          >
            <Ionicons
              name="close"
              size={24}
              style={{ color: themeStyle.colors.grayscale.white }}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text>
            Please enable camera and audio permissions to record a profile
            video.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.colors.grayscale.black,
  },
  cameraBottomSection: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  controlsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});

export default ProfileVideoCamera;
