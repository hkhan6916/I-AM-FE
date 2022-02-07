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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { getExpoPushTokenAsync } from "expo-notifications";
import themeStyle from "../../../theme.style";
import apiCall from "../../../helpers/apiCall";
import ProfileVideoCamera from "../../../components/ProfileVideoCamera";
import { useSelector, useDispatch } from "react-redux";
import PreviewVideo from "../../../components/PreviewVideo";

const Step1Screen = () => {
  const [loading, setLoading] = useState(false);

  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);

  const [cameraActivated, setCameraActivated] = useState(false);

  const [recording, setRecording] = useState(false);
  const [recordingLength, setRecordingLength] = useState(15);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const { width: screenWidth } = Dimensions.get("window");
  const [faceDectected, setFaceDetected] = useState(false);

  const [profileVideo, setProfileVideo] = useState("");
  const [profileVideoPlaying, setProfileVideoPlaying] = useState(false);
  const profileVideoRef = useRef(null);

  const [registerationError, setRegisterationError] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const existingInfo = useSelector((state) => state.userData);

  const checkAllDetailsProvided = () => {
    if (profileVideo && faceDectected) {
      return true;
    }
    return false;
  };

  const handleFacesDetected = (obj) => {
    try {
      if (recording && obj.faces.length !== 0 && !faceDectected) {
        setFaceDetected(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const registerUser = async () => {
    const payload = {
      ...existingInfo.state,
      notificationToken: await getExpoPushTokenAsync({
        experienceId: "@hkhan6916/I-Am-FE",
      }).data,
      file: {
        uri: profileVideo,
        name: "profileVideo.mp4",
        type: "video/mp4",
      },
    };
    console.log(payload);
    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      formData.append(key, payload[key]);
    });
    setLoading(true);
    const { success } = await apiCall("POST", "/user/register", formData);

    setLoading(false);
    if (success) {
      dispatch({
        type: "SET_USER_DATA",
        payload: {},
      });
      navigation.navigate("Login");
    } else {
      setRegisterationError("Error, maybe network error.");
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
      setHasCameraPermission(false);
      setHasAudioPermission(false);
    };
  }, []);

  useEffect(() => {
    if (cameraActivated) {
      navigation.setOptions({ headerShown: false });
    } else {
      navigation.setOptions({ headerShown: true });
    }
  }, [cameraActivated]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size="large"
          color={themeStyle.colors.primary.default}
        />
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
        handleFacesDetected={handleFacesDetected}
        recording={recording}
        recordingLength={recordingLength}
        hasCameraPermission={hasCameraPermission}
        hasAudioPermission={hasAudioPermission}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={{ marginBottom: 48 }}>
        <View style={styles.formContainer}>
          <Text style={styles.signupText}>Your Profile Video</Text>
          <Text style={{ textAlign: "center", fontSize: 16, marginBottom: 20 }}>
            A profile video let&apos;s others know you better as well as your
            career and accomplishments.
          </Text>
          <Modal visible={showHelpModal}>
            <View style={{ alignSelf: "flex-end", margin: 20 }}>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20, justifyContent: "center" }}>
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 16,
                  alignSelf: "flex-start",
                  marginBottom: 10,
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
          </Modal>
          {profileVideo && faceDectected ? (
            <PreviewVideo uri={profileVideo} isFullWidth />
          ) : profileVideo ? (
            <Text style={styles.faceDetectionError}>
              No face detected. Make sure your face is shown at the start and
              end of your profile video.
            </Text>
          ) : null}
          <TouchableOpacity
            style={styles.takeVideoButton}
            onPress={() => {
              setFaceDetected(false);
              setCameraActivated(true);
            }}
          >
            <Text style={styles.takeVideoButtonText}>
              <Ionicons name="videocam" size={14} />{" "}
              {profileVideo ? "Retake profile video" : "Take profile video"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.registerationButton,
              {
                opacity: !checkAllDetailsProvided() ? 0.5 : 1,
              },
            ]}
            onPress={() => registerUser()}
            disabled={!checkAllDetailsProvided()}
          >
            <Text style={styles.registerationButtonText}>
              Sign Up <Ionicons name="paper-plane-outline" size={14} />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginVertical: 20 }}
            onPress={() => setShowHelpModal(true)}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.colors.grayscale.white,
  },
  formContainer: {
    padding: 20,
    backgroundColor: themeStyle.colors.grayscale.white,
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
    color: themeStyle.colors.grayscale.white,
  },
  takeVideoButton: {
    margin: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
    borderRadius: 5,
  },
  takeVideoButtonText: {
    color: themeStyle.colors.grayscale.black,
    fontWeight: "700",
  },
  text: {
    fontSize: 18,
    color: "white",
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
    color: themeStyle.colors.grayscale.black,
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
  },
});
export default React.memo(Step1Screen);
