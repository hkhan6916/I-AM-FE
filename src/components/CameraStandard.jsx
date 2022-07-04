import { useRef, useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView,
  BackHandler,
  Platform,
} from "react-native";
import {
  PinchGestureHandler,
  TapGestureHandler,
} from "react-native-gesture-handler";
import { sortFormats, useCameraDevices } from "react-native-vision-camera";
import * as ScreenOrientation from "expo-screen-orientation";
import openAppSettings from "../helpers/openAppSettings";
import { Camera, frameRateIncluded } from "react-native-vision-camera";
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useSharedValue,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useIsForeground } from "../helpers/hooks/useIsForeground";
import IonIcon from "react-native-vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/core";
import { CaptureButton } from "./CaptureButton";
import { useDispatch } from "react-redux";
import themeStyle from "../theme.style";
import { manipulateAsync } from "expo-image-manipulator";
import useScreenOrientation from "../helpers/hooks/useScreenOrientation";
import { EvilIcons, Ionicons } from "@expo/vector-icons";
import useOrientation from "../helpers/hooks/useOrientation";

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

const SCALE_FULL_ZOOM = 3;
const BUTTON_SIZE = 40;

const CameraStandard = ({
  setCameraActive,
  recording,
  setFile,
  setRecording,
}) => {
  const screenOrientation = useScreenOrientation(true);
  const orientation = useOrientation(recording);

  const iosSpecificProps = Platform.OS === "ios" ? { orientation } : {};

  const camera = useRef(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const zoom = useSharedValue(0);
  const isPressingButton = useSharedValue(false);

  // check if camera page is active
  const isFocussed = useIsFocused();
  const isForeground = useIsForeground();
  const isActive = isFocussed && isForeground;

  const [cameraPosition, setCameraPosition] = useState("back");
  const [flash, setFlash] = useState("off");
  const [enableNightMode, setEnableNightMode] = useState(false);
  const dispatch = useDispatch();
  // camera format settings
  const devices = useCameraDevices();
  const device = devices[cameraPosition];
  const formats = useMemo(() => {
    if (device?.formats == null) return [];
    return device.formats.sort(sortFormats);
  }, [device?.formats]);

  //#region Memos
  const [is60Fps, setIs60Fps] = useState(true);

  const fps = useMemo(() => {
    if (!is60Fps) return 30;

    if (enableNightMode && !device?.supportsLowLightBoost) {
      // User has enabled Night Mode, but Night Mode is not natively supported, so we simulate it by lowering the frame rate.
      return 30;
    }

    const supportsHdrAt60Fps = formats.some(
      (f) =>
        f.supportsVideoHDR &&
        f.frameRateRanges.some((r) => frameRateIncluded(r, 60))
    );

    const supports60Fps = formats.some((f) =>
      f.frameRateRanges.some((r) => frameRateIncluded(r, 60))
    );
    if (!supports60Fps) {
      // 60 FPS is not supported by any format.
      return 30;
    }
    // If nothing blocks us from using it, we default to 60 FPS.
    return 60;
  }, [device?.supportsLowLightBoost, enableNightMode, formats, is60Fps]);

  const supportsCameraFlipping = useMemo(
    () => devices.back != null && devices.front != null,
    [devices.back, devices.front]
  );
  const supportsFlash = device?.hasFlash ?? false;
  const supportsHdr = useMemo(
    () => formats.some((f) => f.supportsVideoHDR || f.supportsPhotoHDR),
    [formats]
  );
  const supports60Fps = useMemo(
    () =>
      formats.some((f) =>
        f.frameRateRanges.some((rate) => frameRateIncluded(rate, 60))
      ),
    [formats]
  );
  const canToggleNightMode = enableNightMode
    ? true // it's enabled so you have to be able to turn it off again
    : (device?.supportsLowLightBoost ?? false) || fps > 30; // either we have native support, or we can lower the FPS
  //#endregion

  //#region Animated Zoom
  // This just maps the zoom factor to a percentage value.
  // so e.g. for [min, neutr., max] values [1, 2, 128] this would result in [0, 0.0081, 1]
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, 20);

  const cameraAnimatedProps = useAnimatedProps(() => {
    const z = Math.max(Math.min(zoom.value, maxZoom), minZoom);
    return {
      zoom: z,
    };
  }, [maxZoom, minZoom, zoom]);
  //#endregion

  //#region Callbacks
  const setIsPressingButton = useCallback(
    (_isPressingButton) => {
      isPressingButton.value = _isPressingButton;
    },
    [isPressingButton]
  );
  // Camera callbacks
  const onError = useCallback((error) => {
    console.error({ error });
  }, []);
  const onInitialized = useCallback(() => {
    setIsCameraInitialized(true);
  }, []);
  const onMediaCaptured = useCallback(
    async (media, type) => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );

      const re = /(?:\.([^.]+))?$/;
      const fileExtension = re.exec(media.path)[1];
      const resizedPhoto =
        type === "photo" &&
        (await manipulateAsync(media.path, [{ resize: { width: 1000 } }], {
          format: `${fileExtension === "jpg" ? "jpeg" : "png"}`,
        }));
      dispatch({ type: "SET_CAMERA_ACTIVATED", payload: false });

      setFile({
        type: `${type === "photo" ? "image" : "video"}/${fileExtension}`,
        name: `${"media."}${fileExtension}`,
        uri: type === "photo" ? resizedPhoto.uri : media.path,
        isSelfie:
          cameraPosition === "front" &&
          type !== "photo" &&
          Platform.OS === "android",
      });
      console.log(
        cameraPosition === "front" &&
          type !== "photo" &&
          Platform.OS === "android"
      );
      setCameraActive(false);
    },
    [cameraPosition]
  );
  const onFlipCameraPressed = useCallback(() => {
    setCameraPosition((p) => (p === "back" ? "front" : "back"));
  }, []);
  const onFlashPressed = useCallback(() => {
    setFlash((f) => (f === "off" ? "on" : "off"));
  }, []);

  const deactivateCamera = async () => {
    setCameraActive(false);
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
    return true;
  };

  const onDoubleTap = useCallback(() => {
    onFlipCameraPressed();
  }, [onFlipCameraPressed]);

  //#endregion
  //#region Effects
  const neutralZoom = device?.neutralZoom ?? 1;
  useEffect(() => {
    // Run everytime the neutralZoomScaled value changes. (reset zoom when device changes)
    zoom.value = neutralZoom;
  }, [neutralZoom, zoom]);

  useEffect(() => {
    (async () => {
      BackHandler.addEventListener("hardwareBackPress", deactivateCamera);
      if (Platform.OS === "android") {
        await ScreenOrientation.unlockAsync();
      }

      await Camera.getCameraPermissionStatus().then(async (status) => {
        setHasCameraPermission(status === "authorized");
        if (status !== "authorized") {
          await Camera.requestCameraPermission().then((status) =>
            setHasCameraPermission(status === "authorized")
          );
        }
      });
      await Camera.getMicrophonePermissionStatus().then(async (status) => {
        setHasMicrophonePermission(status === "authorized");
        if (status !== "authorized") {
          await Camera.requestMicrophonePermission().then((status) =>
            setHasMicrophonePermission(status === "authorized")
          );
        }
      });

      dispatch({ type: "SET_CAMERA_ACTIVATED", payload: true });
    })();
    return async () => {
      BackHandler.removeEventListener("hardwareBackPress", deactivateCamera);
      dispatch({ type: "SET_CAMERA_ACTIVATED", payload: false });
      setHasCameraPermission(false);
      setCameraActive(false);
    };
  }, []);
  //#endregion

  //#region Pinch to Zoom Gesture
  // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
  // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
  const onPinchGesture = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startZoom = zoom.value;
    },
    onActive: (event, context) => {
      // we're trying to map the scale gesture to a linear zoom here
      const startZoom = context.startZoom ?? 0;
      const scale = interpolate(
        event.scale,
        [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
        [-1, 0, 1],
        Extrapolate.CLAMP
      );
      zoom.value = interpolate(
        scale,
        [-1, 0, 1],
        [minZoom, startZoom, maxZoom],
        Extrapolate.CLAMP
      );
    },
  });
  //#endregion
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
          <TouchableOpacity
            onPress={() => {
              dispatch({ type: "SET_CAMERA_ACTIVATED", payload: false });
              setCameraActive(false);
            }}
          >
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
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => setCameraActive(false)}
        style={{
          height: 48,
          width: 48,
          margin: 10,
          zIndex: 9999,
        }}
      >
        <Ionicons
          name="chevron-back"
          size={30}
          color={themeStyle.colors.grayscale.low}
          style={styles.iconShadow}
        />
      </TouchableOpacity>
      {device != null && (
        <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
          <Reanimated.View style={StyleSheet.absoluteFill}>
            <TapGestureHandler onEnded={onDoubleTap} numberOfTaps={2}>
              <ReanimatedCamera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                // fps={fps}
                lowLightBoost={device.supportsLowLightBoost && enableNightMode}
                isActive={isActive}
                onInitialized={onInitialized}
                onError={onError}
                enableZoomGesture={false}
                animatedProps={cameraAnimatedProps}
                photo={true}
                video={true}
                zoom={0}
                audio={hasMicrophonePermission}
                {...iosSpecificProps}
              />
            </TapGestureHandler>
          </Reanimated.View>
        </PinchGestureHandler>
      )}
      <StatusBar hidden />
      <View
        style={[
          {
            position: "absolute",
          },
          screenOrientation === "LANDSCAPE"
            ? {
                right: 0,
                justifyContent: "center",
                height: "100%",
                bottom: 0,
              }
            : { bottom: 0, width: "100%", alignItems: "center" },
        ]}
      >
        <CaptureButton
          style={{
            captureButton: {
              width: screenOrientation === "PORTRAIT" ? "100%" : "auto",
              height: screenOrientation === "PORTRAIT" ? "auto" : "100%",
            },
            captureMode:
              screenOrientation === "PORTRAIT"
                ? {
                    height: 20,
                    width: 20,
                    position: "absolute",
                    right: 50,
                    justifyContent: "center",
                  }
                : {
                    height: 20,
                    width: 20,
                    position: "absolute",
                    top: 50,
                    alignItems: "center",
                  },
          }}
          camera={camera}
          onMediaCaptured={onMediaCaptured}
          cameraZoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          flash={supportsFlash ? flash : "off"}
          enabled={isCameraInitialized && isActive}
          setIsPressingButton={setIsPressingButton}
          setRecording={setRecording}
        />
      </View>

      {/* <StatusBarBlurBackground /> */}

      <View
        style={[
          styles.rightButtonRow,
          screenOrientation === "LANDSCAPE" && { top: 48, left: 20 },
        ]}
      >
        {supportsCameraFlipping && (
          <TouchableOpacity
            style={styles.button}
            onPress={onFlipCameraPressed}
            disabledOpacity={0.4}
          >
            <IonIcon name="camera-reverse" color="white" size={24} />
          </TouchableOpacity>
        )}
        {supportsFlash && (
          <TouchableOpacity
            style={styles.button}
            onPress={onFlashPressed}
            disabledOpacity={0.4}
          >
            <IonIcon
              name={flash === "on" ? "flash" : "flash-off"}
              color="white"
              size={24}
            />
          </TouchableOpacity>
        )}
        {supports60Fps && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setIs60Fps(!is60Fps)}
          >
            <Text style={styles.text}>
              {is60Fps ? "60" : "30"}
              {"\n"}FPS
            </Text>
          </TouchableOpacity>
        )}

        {canToggleNightMode && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setEnableNightMode(!enableNightMode)}
            disabledOpacity={0.4}
          >
            <IonIcon
              name={enableNightMode ? "moon" : "moon-outline"}
              color="white"
              size={24}
            />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.colors.black,
  },
  captureButton: {
    // position: "absolute",
    // alignSelf: "center",
    bottom: 20,
  },
  button: {
    marginBottom: 15,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "rgba(140, 140, 140, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  rightButtonRow: {
    position: "absolute",
    right: 20,
    top: 50,
  },
  text: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default CameraStandard;
