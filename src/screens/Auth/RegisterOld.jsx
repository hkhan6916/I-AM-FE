import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { getExpoPushTokenAsync } from "expo-notifications";
import themeStyle from "../../theme.style";
import apiCall from "../../helpers/apiCall";
import ProfileVideoCamera from "../../components/ProfileVideoCamera";
import Input from "../../components/Input";
import validateEmail from "../../helpers/validateEmail";
import validatePassword from "../../helpers/validatePassword";

const RegisterationScreen = () => {
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});

  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);

  const [cameraActivated, setCameraActivated] = useState(false);

  const [recording, setRecording] = useState(false);
  const [recordingLength, setRecordingLength] = useState(15);

  const { width: screenWidth } = Dimensions.get("window");
  const [faceDectected, setFaceDetected] = useState(false);

  const [profileVideo, setProfileVideo] = useState("");
  const [profileVideoPlaying, setProfileVideoPlaying] = useState(false);
  const profileVideoRef = useRef(null);

  const [registerationError, setRegisterationError] = useState("");
  const navigation = useNavigation();

  const checkAllDetailsProvided = () => {
    if (
      firstName &&
      lastName &&
      email &&
      username &&
      password &&
      profileVideo &&
      faceDectected
    ) {
      return true;
    }
    return false;
  };

  const checkUserExists = async (type, identifier) => {
    const { response, success } = await apiCall("POST", "/user/check/exists", {
      type,
      identifier,
    });
    if (success && response[type]) {
      setValidationErrors({
        ...validationErrors,
        [type]: { exists: response[type].exists },
      });
    }
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

  const validateInfo = async () => {
    const emailValid = await validateEmail(email);
    const passwordValid = await validatePassword(password);
    const emailMessage = !email
      ? "Please enter your email"
      : !emailValid
      ? "This email is not valid"
      : null;
    const passwordMessage = !password
      ? "Please choose a password"
      : !passwordValid
      ? "Password is not secure enough."
      : null;

    const validationResult = Object.assign(
      {},
      !firstName && { firstName: "Please enter your first name" },
      !lastName && { lastName: "Please enter your last name" },
      !username && { username: "Please choose a username" },
      !jobTitle && { username: "Please enter your job title" },
      emailMessage && { email: emailMessage },
      passwordMessage && { password: passwordMessage }
    );

    setValidationErrors(validationResult);
    return validationResult;
  };

  const registerUser = async () => {
    const payload = {
      firstName,
      lastName,
      email,
      password,
      username,
      notificationToken: await getExpoPushTokenAsync({
        experienceId: "@hkhan6916/I-Am-FE",
      }).data,
      file: {
        uri: profileVideo,
        name: "profileVideo.mp4",
        type: "video/mp4",
      },
    };
    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      formData.append(key, payload[key]);
    });
    const validationResults = await validateInfo();
    if (Object.keys(validationResults).length) {
      return;
    }
    setLoading(true);
    const { success, other } = await apiCall(
      "POST",
      "/user/register",
      formData
    );
    setLoading(false);
    if (success) {
      navigation.navigate("Login");
    } else if (other) {
      setValidationErrors(other);
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
          <Text style={styles.signupText}>SIGN UP</Text>
          <Input
            error={validationErrors?.firstName}
            label="First Name"
            value={firstName}
            onChangeText={(v) => {
              setFirstName(v);
              if (validationErrors.firstName) {
                setValidationErrors({
                  ...validationErrors,
                  firstName: null,
                });
              }
            }}
          />
          <Input
            error={validationErrors?.lastName}
            label="Last Name"
            value={lastName}
            onChangeText={(v) => {
              setJobTitle(v);
              if (validationErrors.jobTitle) {
                setValidationErrors({
                  ...validationErrors,
                  jobTitle: null,
                });
              }
            }}
          />
          <Input
            error={validationErrors?.jobTitle}
            label="Job Title"
            value={lastName}
            onChangeText={(v) => {
              setLastName(v);
              if (validationErrors.jobTitle) {
                setValidationErrors({
                  ...validationErrors,
                  jobTitle: null,
                });
              }
            }}
          />
          <Input
            error={
              validationErrors.username?.exists
                ? "A user with this username already exists."
                : validationErrors?.username
            }
            label="Username"
            value={username}
            onChangeText={(v) => {
              setUsername(v);
              if (validationErrors.username) {
                setValidationErrors({
                  ...validationErrors,
                  username: null,
                });
              }
            }}
            onEndEditing={(e) =>
              checkUserExists("username", e.nativeEvent.text)
            }
          />
          <Input
            error={
              validationErrors.email?.exists
                ? "A user with this email already exists."
                : validationErrors?.email
            }
            label="Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (validationErrors.email) {
                setValidationErrors({
                  ...validationErrors,
                  email: null,
                });
              }
            }}
            onEndEditing={(e) => checkUserExists("email", e.nativeEvent.text)}
          />
          <View style={styles.textInputContainer}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.passwordInputContainer,
                validationErrors?.password && {
                  borderColor: themeStyle.colors.error.default,
                },
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholderTextColor={themeStyle.colors.grayscale.low}
                secureTextEntry={!showPassword}
                autoCorrect={false}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (validationErrors.password) {
                    setValidationErrors({
                      ...validationErrors,
                      password: null,
                    });
                  }
                }}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={19}
                />
              </TouchableOpacity>
            </View>
            {validationErrors?.password ? (
              <Text style={styles.errorText}>{validationErrors?.password}</Text>
            ) : null}
            {validationErrors?.password && password ? (
              <View style={styles.passwordGuide}>
                <Text style={styles.errorText}>
                  - Must be at least 8 characters
                </Text>
                <Text style={styles.errorText}>
                  - Must container an uppercase character
                </Text>
                <Text style={styles.errorText}>
                  - Must container an lowercase character
                </Text>
                <Text style={styles.errorText}>- Must container a number</Text>
              </View>
            ) : null}
          </View>
          {profileVideo && faceDectected ? (
            <TouchableOpacity
              style={{
                alignSelf: "center",
              }}
              onPress={() =>
                profileVideoPlaying.isPlaying
                  ? profileVideoRef.current.pauseAsync()
                  : profileVideoRef.current.playAsync()
              }
            >
              <Video
                style={{
                  transform: [{ scaleX: -1 }],
                  alignSelf: "center",
                  width: screenWidth / 1.5,
                  height: (screenWidth * 1.33) / 1.5,
                  borderWidth: 2,
                  borderColor: themeStyle.colors.primary.default,
                  borderRadius: 10,
                }}
                onPlaybackStatusUpdate={(status) =>
                  setProfileVideoPlaying(() => status)
                }
                ref={profileVideoRef}
                source={{
                  uri: profileVideo,
                }}
                isLooping
                resizeMode="cover"
              />
              {!profileVideoPlaying.isPlaying ? (
                <View
                  style={{
                    position: "absolute",
                    alignItems: "center",
                    justifyContent: "center",
                    width: screenWidth / 1.5,
                    height: (screenWidth * 1.33) / 1.5,
                    borderWidth: 2,
                    borderColor: themeStyle.colors.primary.default,
                    borderRadius: 10,
                    backgroundColor: themeStyle.colors.grayscale.lowest,
                    opacity: 0.5,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      position: "absolute",
                      fontSize: 20,
                      textAlign: "center",
                      width: screenWidth / 1.5,
                      color: themeStyle.colors.grayscale.lowest,
                    }}
                  >
                    Tap to preview
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
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
    backgroundColor: themeStyle.colors.grayscale.lowest,
  },
  formContainer: {
    padding: 20,
    backgroundColor: themeStyle.colors.grayscale.lowest,
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
    color: themeStyle.colors.grayscale.lowest,
  },
  takeVideoButton: {
    margin: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
    borderRadius: 5,
  },
  takeVideoButtonText: {
    color: themeStyle.colors.grayscale.lowest,
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
});
export default React.memo(RegisterationScreen);
