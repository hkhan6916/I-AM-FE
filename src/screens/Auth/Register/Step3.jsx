import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Modal,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { getExpoPushTokenAsync } from "expo-notifications";
import themeStyle from "../../../theme.style";
import apiCall from "../../../helpers/apiCall";
import ProfileVideoCamera from "../../../components/ProfileVideoCamera";
import { useSelector, useDispatch } from "react-redux";
import PreviewVideo from "../../../components/PreviewVideo";
import { detectFacesAsync } from "expo-face-detector";
import { getThumbnailAsync } from "expo-video-thumbnails";
import AnimatedLottieView from "lottie-react-native";
import backgroundUpload from "../../../helpers/backgroundUpload";
import Upload from "react-native-background-upload";
import { getItemAsync } from "expo-secure-store";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import openAppSettings from "../../../helpers/openAppSettings";
import { getInfoAsync } from "expo-file-system";

const Step1Screen = () => {
  const [loading, setLoading] = useState(false);

  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);

  const [cameraActivated, setCameraActivated] = useState(false);

  const [showVideoSizeError, setShowVideoSizeError] = useState(false);
  const [tooShort, setTooShort] = useState(false);
  const [tooLong, setTooLong] = useState(false);

  const [recording, setRecording] = useState(false);
  const [recordingLength, setRecordingLength] = useState(20);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const { width: screenWidth } = Dimensions.get("window");
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectingFaces, setDetectingFaces] = useState(false);

  const [profileVideo, setProfileVideo] = useState("");
  const [prevProfileVideo, setPrevProfileVideo] = useState("");

  const [loadingVideo, setLoadingVideo] = useState(false);

  const [skipProfileVideo, setSkipProfileVideo] = useState(false);

  const [registerationError, setRegisterationError] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const existingInfo = useSelector((state) => state.userData);

  const profileVideoIsValid = () => {
    if (tooShort || tooLong) return false;
    if (profileVideo && faceDetected) {
      return true;
    }
    if (skipProfileVideo) {
      return true;
    }
    return false;
  };

  const sendUserData = async (apiUrl, notificationToken) => {
    setLoading(true);
    const filePath =
      Platform.OS == "android"
        ? profileVideo.replace("file://", "")
        : profileVideo;
    if (notificationToken) {
      const token = await getItemAsync("authToken");

      const options = {
        url: `${apiUrl}/user/register`,
        path: filePath, // path to file
        method: "POST",
        type: "multipart",
        maxRetries: 2, // set retry count (Android only). Default 2
        headers: {
          "content-type": "multipart/form-data", // Customize content-type
          Authorization: `Bearer ${token}`,
        },
        parameters: {
          ...existingInfo.state,
          notificationToken,
          flipProfileVideo: (Platform.OS === "android").toString(),
        },
        field: "file",
        // Below are options only supported on Android
        notification: {
          enabled: false,
        },
        useUtf8Charset: true,
        // customUploadId: post?._id,
      };
      // compress in background and .then (()=>startupload)
      Upload.startUpload(options)
        .then((uploadId) => {
          Upload.addListener("progress", uploadId, () => {});
          Upload.addListener("error", uploadId, async (error) => {
            setLoading(false);
            console.log({ error });
            setRegisterationError("An error occurred. Please try again.");
          });
          Upload.addListener("cancelled", uploadId, async (cancelled) => {
            console.log({ cancelled });
            setLoading(false);
            setRegisterationError("An error occurred. Please try again.");
          });
          Upload.addListener("completed", uploadId, (data) => {
            setLoading(false);

            if (JSON.parse(data.responseBody)?.success) {
              dispatch({
                type: "SET_USER_DATA",
                payload: {},
              });
              setTimeout(() => navigation.navigate("Login"), 500);
            } else {
              setRegisterationError("An error occurred. Please try again.");
            }
          });
        })
        .catch(async (catched) => {
          console.log({ catched });
          setLoading(false);
          setRegisterationError("An error occurred. Please try again.");
        });
    }
  };

  const registerUser = async () => {
    const { data: notificationToken } = await getExpoPushTokenAsync({
      experienceId: "@haroonmagnet/Magnet",
    });
    const apiUrl = __DEV__
      ? "http://192.168.5.101:5000"
      : "https://magnet-be.herokuapp.com";

    setRegisterationError("");
    if (profileVideo && !skipProfileVideo) {
      await sendUserData(apiUrl, notificationToken);
    } else {
      setLoading(true);
      const { response, success, message } = await apiCall(
        "POST",
        `/user/register`,
        {
          ...existingInfo.state,
          notificationToken,
          flipProfileVideo: Platform.OS === "android",
        }
      );
      console.log(message);
      setLoading(false);

      if (success) {
        dispatch({
          type: "SET_USER_DATA",
          payload: {},
        });
        setTimeout(() => navigation.navigate("Login"), 500);
      } else {
        setRegisterationError("An error occurred. Please try again.");
      }
    }
  };

  const handleFaceDetection = async (duration) => {
    setLoadingVideo(true);
    setTooShort(false);
    setTooLong(false);
    setDetectingFaces(true);
    if (Number(duration) < 3000) {
      setDetectingFaces(false);
      setLoadingVideo(false);
      setTooShort(true);
      return;
    }
    if (Number(duration) > 30000) {
      setDetectingFaces(false);
      setLoadingVideo(false);
      setTooLong(true);
      return;
    }
    setDetectingFaces(true);
    const { uri } = await getThumbnailAsync(profileVideo, {
      time: 3000,
    });
    const { faces } = await detectFacesAsync(uri);

    if (faces?.length) {
      setFaceDetected(true);
      setPrevProfileVideo(profileVideo);
    } else {
      setFaceDetected(false);
    }
    setDetectingFaces(false);
    setLoadingVideo(false);
  };

  const pickProfileVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Unable access camera roll",
        "Please enable storage permissions to upload a profile video.",
        [
          {
            text: "Cancel",
          },
          {
            text: "Settings",
            onPress: () => openAppSettings(),
          },
        ]
      );
    }

    if (status === "granted") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.3,
        allowsMultipleSelection: false,
      });
      if (!result.cancelled) {
        setFaceDetected(false);
        setDetectingFaces(false);

        const mediaInfo = await getInfoAsync(result.uri);
        const mediaSizeInMb = mediaInfo.size / 1000000;
        if (mediaSizeInMb > 50) {
          setShowVideoSizeError(true);
          setProfileVideo(result.uri);
          setLoading(false);
          return;
        }
        setShowVideoSizeError(false);
        setProfileVideo(result.uri);
      }
    }
  };

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === "granted");
      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      setHasAudioPermission(audioStatus.status === "granted");
    })();
    return () => {
      setHasCameraPermission(null);
      setHasAudioPermission(null);
    };
  }, [cameraActivated]);

  useEffect(() => {
    if (cameraActivated || loading) {
      navigation.setOptions({ headerShown: false });
    } else {
      navigation.setOptions({ headerShown: true });
    }
  }, [cameraActivated, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            color: themeStyle.colors.grayscale.lowest,
            fontSize: 20,
            fontWeight: "700",
          }}
        >
          Creating your account
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontSize: 12,
            color: themeStyle.colors.grayscale.lowest,
          }}
        >
          This usually takes less than 15 seconds...
        </Text>
        <View style={{ width: 200, height: 200 }}>
          <AnimatedLottieView
            source={require("../../../../assets/lotties/loadingBlocks.json")}
            autoPlay
            loop
            speed={1}
          />
        </View>
      </View>
    );
  }

  if (cameraActivated) {
    return (
      <ProfileVideoCamera
        setRecording={setRecording}
        setProfileVideo={setProfileVideo}
        setCameraActivated={setCameraActivated}
        setRecordingLength={setRecordingLength}
        recording={recording}
        recordingLength={recordingLength}
        hasCameraPermission={hasCameraPermission}
        hasAudioPermission={hasAudioPermission}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ marginBottom: 48 }}>
        <View style={styles.formContainer}>
          <Text
            style={[styles.signupText, skipProfileVideo && { opacity: 0.1 }]}
          >
            Your Profile Video
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontSize: 16,
              marginBottom: 20,
              color: themeStyle.colors.grayscale.lowest,
              opacity: skipProfileVideo ? 0.1 : 1,
            }}
          >
            A profile video lets others know you better alongside your career
            and accomplishments.
          </Text>
          <Modal
            visible={showHelpModal}
            onRequestClose={() => setShowHelpModal(false)}
          >
            <SafeAreaView
              style={{
                backgroundColor: themeStyle.colors.grayscale.highest,
                flex: 1,
              }}
            >
              <View style={{ alignSelf: "flex-end", margin: 20 }}>
                <TouchableOpacity
                  disabled={skipProfileVideo}
                  onPress={() => setShowHelpModal(false)}
                  style={{ opacity: skipProfileVideo ? 0.1 : 1 }}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={themeStyle.colors.grayscale.lowest}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ padding: 20, justifyContent: "center" }}>
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 16,
                    alignSelf: "flex-start",
                    marginBottom: 10,
                    color: themeStyle.colors.grayscale.lowest,
                  }}
                >
                  Some things you could mention about yourself:
                </Text>
                <Text style={styles.helpModalListItem}>
                  - Your job title and role
                </Text>
                <Text style={styles.helpModalListItem}>
                  - Your current or past education
                </Text>
                <Text style={styles.helpModalListItem}>
                  - The company you work for
                </Text>
                <Text style={styles.helpModalListItem}>
                  - The university you attend/attended
                </Text>
                <Text style={styles.helpModalListItem}>
                  - Your accomplishments
                </Text>
                <Text style={styles.helpModalListItem}>- Your goals</Text>
                <Text style={styles.helpModalListItem}>- Your hobbies</Text>
              </View>
            </SafeAreaView>
          </Modal>
          {profileVideo && faceDetected && !skipProfileVideo ? (
            <View>
              <PreviewVideo
                uri={profileVideo}
                isFullWidth
                flipProfileVideo={Platform.OS === "android"}
                onLoad={(info) => handleFaceDetection(info?.durationMillis)}
              />
              {(tooShort || tooLong) && !loadingVideo && !detectingFaces ? (
                <Text style={styles.faceDetectionError}>
                  {tooShort
                    ? "Profile video must be at least 3 seconds long."
                    : tooLong
                    ? "Profile video must be no longer than 30 seconds."
                    : ""}
                </Text>
              ) : null}
            </View>
          ) : profileVideo && !skipProfileVideo ? (
            <View>
              <PreviewVideo
                uri={profileVideo}
                isFullWidth
                flipProfileVideo={Platform.OS === "android"}
                onLoad={(info) => handleFaceDetection(info?.durationMillis)}
              />
              {!detectingFaces && !loadingVideo ? (
                <Text style={styles.faceDetectionError}>
                  {tooShort
                    ? "Profile video must be at least 3 seconds long."
                    : tooLong
                    ? "Profile video must be no longer than 30 seconds."
                    : !faceDetected
                    ? "Face was not fully detected. Please make sure your face is shown at the start and end of your profile video when introducing yourself."
                    : ""}
                </Text>
              ) : null}
            </View>
          ) : null}
          <View style={{ opacity: skipProfileVideo ? 0.1 : 1 }}>
            <TouchableOpacity
              disabled={skipProfileVideo}
              style={[styles.takeVideoButton]}
              onPress={() => {
                setFaceDetected(false);
                setCameraActivated(true);
              }}
            >
              <Text style={[styles.takeVideoButtonText]}>
                <Ionicons
                  name="videocam"
                  size={14}
                  color={themeStyle.colors.primary.default}
                />{" "}
                Take profile video
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                textAlign: "center",
                color: themeStyle.colors.grayscale.lowest,
                fontWeight: "700",
              }}
            >
              or
            </Text>
            <TouchableOpacity
              onPress={() => pickProfileVideo()}
              style={[styles.uploadVideoButton]}
            >
              <Text
                style={{
                  color: themeStyle.colors.primary.default,
                  fontWeight: "900",
                }}
              >
                <FontAwesome5
                  name="images"
                  size={14}
                  color={themeStyle.colors.primary.default}
                />{" "}
                Upload profile video
              </Text>
            </TouchableOpacity>
          </View>
          {!skipProfileVideo ? (
            <TouchableOpacity
              disabled={skipProfileVideo}
              style={{ opacity: skipProfileVideo ? 0.1 : 1 }}
              onPress={() => setSkipProfileVideo(true)}
            >
              <Text
                style={{
                  color: themeStyle.colors.secondary.default,
                  fontWeight: "700",
                  marginVertical: 20,
                }}
              >
                Skip for now
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[
              styles.registerationButton,
              {
                opacity: !profileVideoIsValid() || loadingVideo ? 0.5 : 1,
              },
            ]}
            onPress={() => registerUser()}
            disabled={!profileVideoIsValid() || loadingVideo}
          >
            <Text style={styles.registerationButtonText}>
              Sign Up <Ionicons name="paper-plane-outline" size={14} />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginVertical: 20,
              width: "100%",
              opacity: skipProfileVideo ? 0.1 : 1,
            }}
            onPress={() => setShowHelpModal(true)}
            disabled={skipProfileVideo}
          >
            <Text
              style={{
                color: themeStyle.colors.secondary.default,
                fontWeight: "700",
              }}
            >
              Need ideas?
            </Text>
          </TouchableOpacity>
          {registerationError ? (
            <Text style={styles.registerationError}>{registerationError}</Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.colors.grayscale.highest,
  },
  formContainer: {
    padding: 20,
    backgroundColor: themeStyle.colors.grayscale.highest,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  registerationError: {
    textAlign: "center",
    color: themeStyle.colors.error.default,
    fontWeight: "500",
  },
  faceDetectionError: {
    color: themeStyle.colors.error.default,
    textAlign: "center",
    fontWeight: "700",
    marginVertical: 20,
    marginHorizontal: 10,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  registerationButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 20,
    borderRadius: 50,
    backgroundColor: themeStyle.colors.primary.default,
  },
  registerationButtonText: {
    color: themeStyle.colors.white,
  },
  takeVideoButton: {
    margin: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
    borderRadius: 5,
  },
  uploadVideoButton: {
    margin: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
    borderRadius: 5,
  },
  takeVideoButtonText: {
    color: themeStyle.colors.primary.default,
    fontWeight: "900",
  },
  text: {
    fontSize: 18,
    color: themeStyle.colors.highest,
  },
  errorText: {
    fontSize: 12,
    color: themeStyle.colors.error.default,
  },
  label: {
    fontWeight: "700",
  },
  visibleTextInputs: {
    fontSize: 15,
    height: 45,
    borderRadius: 5,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
  },
  textInputContainer: {
    alignSelf: "stretch",
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: themeStyle.colors.grayscale.lowest,
  },
  passwordInputContainer: {
    flexDirection: "row",
    height: 45,
    borderRadius: 5,
    padding: 5,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
  },
  passwordGuide: {
    marginTop: 10,
  },
  eyeIcon: {
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  signupText: {
    padding: 20,
    fontSize: 30,
    color: themeStyle.colors.primary.default,
    fontWeight: "700",
  },
  helpModalListItem: {
    fontWeight: "700",
    fontSize: 14,
    color: themeStyle.colors.grayscale.lowest,
  },
});
export default React.memo(Step1Screen);
