// import React, { useState, useEffect } from "react";
// import {
//   Text,
//   View,
//   TouchableOpacity,
//   Dimensions,
//   Linking,
//   Platform,
//   BackHandler,
// } from "react-native";
// import { Camera } from "expo-camera";
// import { Ionicons, EvilIcons } from "@expo/vector-icons";
// import { DeviceMotion } from "expo-sensors";
// import { useDispatch } from "react-redux";
// import { useNavigation } from "@react-navigation/native";
// import { manipulateAsync } from "expo-image-manipulator";
// import { startActivityAsync, ActivityAction } from "expo-intent-launcher";
// import Constants from "expo-constants";
// import themeStyle from "../theme.style";

// const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
// const CameraStandard = ({
//   setCameraActive,
//   recording,
//   setFile,
//   setRecording,
// }) => {
//   const [hasCameraPermission, setHasCameraPermission] = useState(null);
//   const [hasMicrophonePermission, setHasMicrophonePermission] = useState(null);
//   const [cameraRef, setCameraRef] = useState(null);
//   const [type, setType] = useState(Camera.Constants.Type.back);
//   const [orientation, setOrientation] = useState("portrait");
//   const dispatch = useDispatch();
//   const navigation = useNavigation();

//   const packageName = Constants.manifest.releaseChannel
//     ? Constants.manifest.android.package
//     : "host.exp.exponent";

//   const openAppSettings = () => {
//     if (Platform.OS === "ios") {
//       Linking.openURL("app-settings:");
//     } else {
//       startActivityAsync(ActivityAction.APPLICATION_DETAILS_SETTINGS, {
//         data: `package:${packageName}`,
//       });
//     }
//   };

//   useEffect(() => {
//     (async () => {
//       const { status: cameraStatus } =
//         await Camera.requestCameraPermissionsAsync();
//       const { status: microphoneStatus } =
//         await Camera.requestMicrophonePermissionsAsync();

//       setHasCameraPermission(cameraStatus === "granted");
//       setHasMicrophonePermission(microphoneStatus === "granted");
//       dispatch({ type: "SET_CAMERA_ACTIVATED", payload: true });
//     })();
//     return () => {
//       dispatch({ type: "SET_CAMERA_ACTIVATED", payload: false });
//       DeviceMotion.removeAllListeners();
//       setHasCameraPermission(false);
//       setCameraActive(false);
//       setCameraRef(null);
//     };
//   }, [navigation]);

//   useEffect(() => {
//     DeviceMotion.addListener(({ rotation }) => {
//       const gamma = rotation?.gamma;
//       const beta = Math.abs(rotation?.beta);

//       const absGamma = Math.abs(gamma);
//       const absBeta = Math.abs(beta);
//       let ort;
//       if (absGamma <= 0.04 && absBeta <= 0.24) {
//         ort = "portrait";
//       } else if ((absGamma <= 1.0 || absGamma >= 2.3) && absBeta >= 0.5) {
//         ort = "portrait";
//       } else if (gamma < 0) {
//         ort =
//           type === Camera.Constants.Type.front
//             ? "landscape-right"
//             : "landscape-left";
//       } else {
//         ort =
//           type === Camera.Constants.Type.front
//             ? "landscape-left"
//             : "landscape-right";
//       }

//       setOrientation(ort);
//     });

//     return () => {
//       DeviceMotion.removeAllListeners();
//     };
//   }, [type]);
//   const deactivateCamera = () => {
//     setCameraActive(false);
//     return true;
//   };

//   useEffect(() => {
//     BackHandler.addEventListener("hardwareBackPress", deactivateCamera);
//     return () => {
//       setRecording(false);
//       setCameraActive(false);
//       BackHandler.removeEventListener("hardwareBackPress", deactivateCamera);
//     };
//   }, []);
//   if (hasCameraPermission === null || hasMicrophonePermission === null) {
//     return <View />;
//   }
//   if (hasCameraPermission === false || hasMicrophonePermission === false) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           alignItems: "center",
//           justifyContent: "center",
//           backgroundColor: themeStyle.colors.primary.default,
//         }}
//       >
//         <View
//           style={{
//             borderColor: themeStyle.colors.grayscale.white,
//             borderWidth: 3,
//             padding: 20,
//             width: 150,
//             height: 150,
//             borderRadius: 200,
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <EvilIcons
//             name="camera"
//             size={104}
//             color={themeStyle.colors.grayscale.white}
//           />
//         </View>
//         <Text
//           style={{
//             margin: 20,
//             textAlign: "center",
//             color: themeStyle.colors.grayscale.white,
//           }}
//         >
//           Well...? No worries, this should be easy. Please enable{" "}
//           {!hasCameraPermission && !hasMicrophonePermission
//             ? "camera and microphone permissions"
//             : !hasMicrophonePermission
//             ? "microphone permission"
//             : !hasCameraPermission
//             ? "camera permission"
//             : null}{" "}
//           in device settings. That way you can post cool photos and videos!
//         </Text>
//         <View style={{ display: "flex", flexDirection: "row" }}>
//           <TouchableOpacity onPress={() => navigation.navigate("Home")}>
//             <View
//               style={{
//                 display: "flex",
//                 flexDirection: "row",
//                 alignItems: "center",
//                 margin: 10,
//                 padding: 5,
//                 borderRadius: 5,
//                 borderWidth: 2,
//                 borderColor: themeStyle.colors.grayscale.white,
//               }}
//             >
//               <Text
//                 style={{
//                   textAlign: "center",
//                   color: themeStyle.colors.grayscale.white,
//                   fontWeight: "700",
//                 }}
//               >
//                 Go to Home{" "}
//               </Text>
//             </View>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => openAppSettings()}>
//             <View
//               style={{
//                 display: "flex",
//                 flexDirection: "row",
//                 alignItems: "center",
//                 margin: 10,
//                 padding: 5,
//                 borderRadius: 5,
//                 borderWidth: 2,
//                 borderColor: themeStyle.colors.grayscale.white,
//               }}
//             >
//               <Text
//                 style={{
//                   textAlign: "center",
//                   color: themeStyle.colors.grayscale.white,
//                   fontWeight: "700",
//                 }}
//               >
//                 Go to Settings{" "}
//               </Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }
//   return (
//     <View
//       style={{ flex: 1, backgroundColor: themeStyle.colors.grayscale.black }}
//     >
//       <TouchableOpacity
//         onPress={() => setCameraActive(false)}
//         style={{
//           height: 48,
//           width: 48,
//           margin: 15,
//         }}
//       >
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <Ionicons
//             name="arrow-back"
//             size={24}
//             color={themeStyle.colors.grayscale.white}
//           />
//           <Text
//             style={{ color: themeStyle.colors.grayscale.white, marginLeft: 10 }}
//           >
//             Back
//           </Text>
//         </View>
//       </TouchableOpacity>
//       <Camera
//         mirror
//         style={{
//           width: screenWidth,
//           height: screenWidth * 1.33,
//           marginTop: (screenHeight - screenWidth * 1.33) / 2,
//           marginBottom: (screenHeight - screenWidth * 1.33) / 2,
//         }}
//         ratio="4:3"
//         type={type}
//         ref={(ref) => {
//           setCameraRef(ref);
//         }}
//       >
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "transparent",
//             justifyContent: "flex-end",
//           }}
//         >
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-evenly",
//             }}
//           >
//             <TouchableOpacity
//               style={{
//                 width: 50,
//                 alignSelf: "flex-end",
//               }}
//               onPress={() => {
//                 setType(
//                   type === Camera.Constants.Type.back
//                     ? Camera.Constants.Type.front
//                     : Camera.Constants.Type.back
//                 );
//               }}
//             >
//               <Ionicons
//                 name="camera-reverse-outline"
//                 size={40}
//                 color={themeStyle.colors.grayscale.white}
//               />
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={{ alignSelf: "center", width: 50 }}
//               onPress={async () => {
//                 if (cameraRef) {
//                   const photo = await cameraRef.takePictureAsync({
//                     quality: 0,
//                     onpointercancel,
//                   });
//                   const re = /(?:\.([^.]+))?$/;
//                   const fileExtension = re.exec(photo.uri)[1];
//                   const resizedPhoto = await manipulateAsync(
//                     photo.uri,
//                     [{ resize: { width: 1000 } }],
//                     { format: `${fileExtension === "jpg" ? "jpeg" : "png"}` }
//                   );
//                   setFile({
//                     type: `image/${fileExtension}`,
//                     name: `${"media."}${fileExtension}`,
//                     uri: resizedPhoto.uri,
//                     orientation,
//                     isSelfie: type === Camera.Constants.Type.front,
//                   });
//                   setCameraActive(false);
//                 }
//               }}
//             >
//               <View
//                 style={{
//                   borderWidth: 2,
//                   borderRadius: 25,
//                   borderColor: "white",
//                   height: 50,
//                   width: 50,
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//               >
//                 <View
//                   style={{
//                     borderWidth: 2,
//                     borderRadius: 25,
//                     borderColor: "white",
//                     height: 40,
//                     width: 40,
//                     backgroundColor: "white",
//                   }}
//                 />
//               </View>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={{ alignSelf: "center", width: 50 }}
//               onPress={async () => {
//                 if (!recording) {
//                   setRecording(true);
//                   const video = await cameraRef.recordAsync({
//                     quality: Camera.Constants.VideoQuality["720p"],
//                   });

//                   setFile({
//                     type: "video/mp4",
//                     name: "media.mp4",
//                     uri: video.uri,
//                     orientation,
//                     isSelfie: type === Camera.Constants.Type.front,
//                   });
//                 } else {
//                   setRecording(false);
//                   setCameraActive(false);
//                   cameraRef.stopRecording();
//                 }
//               }}
//             >
//               <View
//                 style={{
//                   borderWidth: 2,
//                   borderRadius: 25,
//                   borderColor: themeStyle.colors.error.default,
//                   height: 50,
//                   width: 50,
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//               >
//                 {recording ? (
//                   <View
//                     style={{
//                       borderWidth: 2,
//                       borderRadius: 5,
//                       borderColor: themeStyle.colors.error.default,
//                       height: 25,
//                       width: 25,
//                       backgroundColor: themeStyle.colors.error.default,
//                     }}
//                   />
//                 ) : (
//                   <View
//                     style={{
//                       borderWidth: 2,
//                       borderRadius: 25,
//                       borderColor: themeStyle.colors.error.default,
//                       height: 40,
//                       width: 40,
//                       backgroundColor: themeStyle.colors.error.default,
//                     }}
//                   />
//                 )}
//               </View>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Camera>
//     </View>
//   );
// };

// export default CameraStandard;

import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Camera } from "expo-camera";
import { Video } from "expo-av";
const WINDOW_HEIGHT = Dimensions.get("window").height;
const closeButtonSize = Math.floor(WINDOW_HEIGHT * 0.032);
const captureSize = Math.floor(WINDOW_HEIGHT * 0.09);

export default function Videorecord() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isPreview, setIsPreview] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoSource, setVideoSource] = useState(null);
  const cameraRef = useRef();
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);
  const onCameraReady = () => {
    setIsCameraReady(true);
  };
  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true, skipProcessing: true };
      const data = await cameraRef.current.takePictureAsync(options);
      const source = data.uri;
      if (source) {
        await cameraRef.current.pausePreview();
        setIsPreview(true);
        console.log("picture source", source);
      }
    }
  };
  const recordVideo = async () => {
    if (cameraRef.current) {
      try {
        const videoRecordPromise = cameraRef.current.recordAsync();
        if (videoRecordPromise) {
          setIsVideoRecording(true);
          const data = await videoRecordPromise;
          const source = data.uri;
          if (source) {
            setIsPreview(true);
            console.log("video source", source);
            setVideoSource(source);
          }
        }
      } catch (error) {
        console.warn(error);
      }
    }
  };
  const stopVideoRecording = () => {
    if (cameraRef.current) {
      setIsPreview(false);
      setIsVideoRecording(false);
      cameraRef.current.stopRecording();
    }
  };
  const switchCamera = () => {
    if (isPreview) {
      return;
    }
    setCameraType((prevCameraType) =>
      prevCameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };
  const cancelPreview = async () => {
    await cameraRef.current.resumePreview();
    setIsPreview(false);
    setVideoSource(null);
  };
  const renderCancelPreviewButton = () => (
    <TouchableOpacity onPress={cancelPreview} style={styles.closeButton}>
      <View style={[styles.closeCross, { transform: [{ rotate: "45deg" }] }]} />
      <View
        style={[styles.closeCross, { transform: [{ rotate: "-45deg" }] }]}
      />
    </TouchableOpacity>
  );
  const renderVideoPlayer = () => (
    <Video
      source={{ uri: videoSource }}
      shouldPlay={true}
      style={styles.media}
    />
  );
  const renderVideoRecordIndicator = () => (
    <View style={styles.recordIndicatorContainer}>
      <View style={styles.recordDot} />
      <Text style={styles.recordTitle}>{"Recording..."}</Text>
    </View>
  );
  const renderCaptureControl = () => (
    <View style={styles.control}>
      <TouchableOpacity disabled={!isCameraReady} onPress={switchCamera}>
        <Text style={styles.text}>{"Flip"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={!isCameraReady}
        onLongPress={recordVideo}
        onPressOut={stopVideoRecording}
        onPress={takePicture}
        style={styles.capture}
      />
    </View>
  );
  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text style={styles.text}>No access to camera</Text>;
  }
  return (
    <SafeAreaView style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.container}
        type={cameraType}
        flashMode={Camera.Constants.FlashMode.off}
        onCameraReady={onCameraReady}
        onMountError={(error) => {
          console.log("cammera error", error);
        }}
      />
      <View style={styles.container}>
        {isVideoRecording && renderVideoRecordIndicator()}
        {videoSource && renderVideoPlayer()}
        {isPreview && renderCancelPreviewButton()}
        {!videoSource && !isPreview && renderCaptureControl()}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: "absolute",
    top: 35,
    left: 15,
    height: closeButtonSize,
    width: closeButtonSize,
    borderRadius: Math.floor(closeButtonSize / 2),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c4c5c4",
    opacity: 0.7,
    zIndex: 2,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  closeCross: {
    width: "68%",
    height: 1,
    backgroundColor: "black",
  },
  control: {
    position: "absolute",
    flexDirection: "row",
    bottom: 38,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  capture: {
    backgroundColor: "#f5f6f5",
    height: captureSize,
    width: captureSize,
    borderRadius: Math.floor(captureSize / 2),
    marginHorizontal: 31,
  },
  recordIndicatorContainer: {
    flexDirection: "row",
    position: "absolute",
    top: 25,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    opacity: 0.7,
  },
  recordTitle: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
  },
  recordDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
    backgroundColor: "#ff0000",
    marginHorizontal: 5,
  },
  text: {
    color: "#fff",
  },
});
