import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  BackHandler,
  StatusBar,
} from "react-native";
import { Camera } from "expo-camera";
import { Ionicons, EvilIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { manipulateAsync } from "expo-image-manipulator";
import themeStyle from "../theme.style";
import useScreenOrientation from "../helpers/hooks/useScreenOrientation";
import * as ScreenOrientation from "expo-screen-orientation";
import openAppSettings from "../helpers/openAppSettings";
import secondsToHms from "../helpers/secondsToHoursAndMinutes";

openAppSettings;
const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
const CameraStandard = ({
  setCameraActive,
  recording,
  setFile,
  setRecording,
}) => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(null);
  const [recordingLength, setRecordingLength] = useState(0);
  const cameraRef = useRef();
  const maxLength = 3600;
  const [type, setType] = useState(Camera.Constants.Type.back);
  const dispatch = useDispatch();

  const screenOrientation = useScreenOrientation(true);

  const controlsPosition =
    screenOrientation === "LANDSCAPE"
      ? {
          right: 20,
          height: "100%",
          top: 0,
          justifyContent: "center",
          alignItems: "center",
        }
      : { bottom: 0 };

  const cameraStyles =
    screenOrientation === "LANDSCAPE"
      ? {
          width: screenWidth * 1.33,
          height: screenWidth,
        }
      : {
          width: screenWidth,
          height: screenWidth * 1.33,
          marginTop: (screenHeight - screenWidth * 1.33) / 2,
          marginBottom: (screenHeight - screenWidth * 1.33) / 2,
        };

  useEffect(() => {
    (async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL);

      const { status: cameraStatus } =
        await Camera.requestCameraPermissionsAsync();
      const { status: microphoneStatus } =
        await Camera.requestMicrophonePermissionsAsync();

      setHasCameraPermission(cameraStatus === "granted");
      setHasMicrophonePermission(microphoneStatus === "granted");
      dispatch({ type: "SET_CAMERA_ACTIVATED", payload: true });
    })();
    return async () => {
      dispatch({ type: "SET_CAMERA_ACTIVATED", payload: false });
      setHasCameraPermission(false);
      setCameraActive(false);
    };
  }, []);

  const deactivateCamera = () => {
    setCameraActive(false);
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", deactivateCamera);
    return () => {
      setRecording(false);
      setCameraActive(false);
      BackHandler.removeEventListener("hardwareBackPress", deactivateCamera);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      let length = recordingLength;
      const interval = setInterval(() => {
        if (recording && length < maxLength) {
          length += 1;
          setRecordingLength(length);
        }
      }, 1000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [recording]);
  if (hasCameraPermission === null || hasMicrophonePermission === null) {
    return <View />;
  }
  if (hasCameraPermission === false || hasMicrophonePermission === false) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: themeStyle.colors.grayscale.highest,
        }}
      >
        <View
          style={{
            borderColor: themeStyle.colors.primary.default,
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
            color={themeStyle.colors.primary.default}
          />
        </View>
        <Text
          style={{
            margin: 20,
            textAlign: "center",
            color: themeStyle.colors.primary.default,
          }}
        >
          Please grant{" "}
          {!hasCameraPermission && !hasMicrophonePermission
            ? "camera and microphone permissions"
            : !hasMicrophonePermission
            ? "microphone permissions"
            : !hasCameraPermission
            ? "camera permissions"
            : null}{" "}
          in device settings. That way you can share cool photos and videos!
        </Text>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <TouchableOpacity onPress={() => setCameraActive(false)}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                margin: 10,
                padding: 5,
                borderRadius: 5,
                borderWidth: 2,
                borderColor: themeStyle.colors.primary.default,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: themeStyle.colors.grayscale.lowest,
                  fontWeight: "700",
                  width: 70,
                }}
              >
                Back{" "}
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
                backgroundColor: themeStyle.colors.secondary.default,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: themeStyle.colors.white,
                  fontWeight: "700",
                  width: 70,
                }}
              >
                Settings{" "}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: themeStyle.colors.grayscale.highest,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <StatusBar hidden />
      <TouchableOpacity
        onPress={() => setCameraActive(false)}
        style={{
          height: 48,
          width: 48,
          margin: 15,
          position: "absolute",
          top: 0,
          left: 20,
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
      {recordingLength ? (
        <Text
          style={{
            color:
              recordingLength < maxLength - 10
                ? themeStyle.colors.white
                : themeStyle.colors.error.default,
            padding: 5,
            backgroundColor: themeStyle.colors.grayscale.low,
            position: "absolute",
            top: 20,
            right: 20,
            borderRadius: 20,
            width: 60,
            textAlign: "center",
          }}
        >
          {secondsToHms(recordingLength)}
        </Text>
      ) : null}
      <Camera style={cameraStyles} ratio="4:3" type={type} ref={cameraRef}>
        <View
          style={{
            flex: 1,
            backgroundColor: "transparent",
            justifyContent: "flex-end",
            marginBottom: 10,
          }}
        >
          <View
            style={{
              flexDirection:
                screenOrientation === "PORTRAIT" ? "row" : "column",
              position: "absolute",
              alignSelf: "center",
              ...controlsPosition,
            }}
          >
            <TouchableOpacity
              style={[
                { alignSelf: "center", width: 50 },
                screenOrientation === "PORTRAIT"
                  ? { marginHorizontal: 20 }
                  : { marginVertical: 20 },
              ]}
              disabled={recording}
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
                color={
                  !recording
                    ? themeStyle.colors.grayscale.lowest
                    : themeStyle.colors.grayscale.high
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                { alignSelf: "center", width: 50 },
                screenOrientation === "PORTRAIT"
                  ? { marginHorizontal: 20 }
                  : { marginVertical: 20 },
              ]}
              onPress={async () => {
                if (cameraRef?.current) {
                  const photo = await cameraRef?.current?.takePictureAsync({
                    quality: 0,
                    mirror: false,
                  });
                  await ScreenOrientation.lockAsync(
                    ScreenOrientation.OrientationLock.PORTRAIT_UP
                  );
                  const re = /(?:\.([^.]+))?$/;
                  const fileExtension = re.exec(photo.uri)[1];
                  const resizedPhoto = await manipulateAsync(
                    photo.uri,
                    [{ resize: { width: 1000 } }],
                    { format: `${fileExtension === "jpg" ? "jpeg" : "png"}` }
                  );
                  setFile({
                    type: `image/${fileExtension}`,
                    name: `${"media."}${fileExtension}`,
                    uri: resizedPhoto.uri,
                    isSelfie: type === Camera.Constants.Type.front,
                  });
                  setCameraActive(false);
                }
              }}
            >
              <View
                style={{
                  borderWidth: 5,
                  borderRadius: 60,
                  borderColor: themeStyle.colors.grayscale.lowest,
                  height: 60,
                  width: 60,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              ></View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                { alignSelf: "center", width: 50 },
                screenOrientation === "PORTRAIT"
                  ? { marginHorizontal: 20 }
                  : { marginVertical: 20 },
              ]}
              onPress={async () => {
                if (!recording) {
                  setRecording(true);
                  const video = await cameraRef?.current?.recordAsync({
                    quality: Camera.Constants.VideoQuality["720p"],
                    // mirror: false,
                    mirror: true,
                  });

                  if (video) {
                    setFile({
                      type: "video/mp4",
                      name: "media.mp4",
                      uri: video.uri,
                      isSelfie: type === Camera.Constants.Type.front,
                    });
                  }
                } else {
                  await ScreenOrientation.lockAsync(
                    ScreenOrientation.OrientationLock.PORTRAIT_UP
                  );
                  cameraRef?.current?.stopRecording();
                  setRecording(false);
                  setCameraActive(false);
                }
              }}
            >
              <View
                style={{
                  borderWidth: 5,
                  borderRadius: 60,
                  borderColor: themeStyle.colors.error.default,
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
                      borderColor: themeStyle.colors.error.default,
                      height: 25,
                      width: 25,
                      backgroundColor: themeStyle.colors.error.default,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      borderWidth: 5,
                      borderRadius: 60,
                      borderColor: themeStyle.colors.grayscale.lowest,
                      height: 60,
                      width: 60,
                      backgroundColor: themeStyle.colors.error.default,
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
};

export default CameraStandard;
