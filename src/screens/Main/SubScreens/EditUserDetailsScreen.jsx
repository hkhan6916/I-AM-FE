import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { getItemAsync } from "expo-secure-store";
import themeStyle from "../../../theme.style";
import apiCall from "../../../helpers/apiCall";
import ProfileVideoCamera from "../../../components/ProfileVideoCamera";
import PreviewVideo from "../../../components/PreviewVideo";
import ContentLoader from "../../../components/ContentLoader";
import InputNoBorder from "../../../components/InputNoBorder";
import validateEmail from "../../../helpers/validateEmail";
import validatePassword from "../../../helpers/validatePassword";
import PasswordInputNoBorder from "../../../components/PasswordInputNoBorder";

const { statusBarHeight } = Constants;
const EditUserDetailsScreen = () => {
  const { width: screenWidth } = Dimensions.get("window");
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userId, setUserId] = useState("");

  const [email, setEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [jobTitle, setJobTitle] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [initialProfileData, setInitialProfileData] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);

  const [cameraActivated, setCameraActivated] = useState(false);

  const [recording, setRecording] = useState(false);
  const [recordingLength, setRecordingLength] = useState(15);

  const [faceDetected, setFaceDetected] = useState(false);

  const [profileVideo, setProfileVideo] = useState("");

  const [updateError, setupdateError] = useState("");

  const [showUpdatedPill, setShowUpdatedPill] = useState(false);

  const navigation = useNavigation();

  const handleFacesDetected = (obj) => {
    try {
      if (recording && obj.faces.length !== 0 && !faceDetected) {
        setFaceDetected(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const validateInfo = async () => {
    const emailValid = email ? await validateEmail(email) : true;
    const passwordValid = password ? await validatePassword(password) : true;
    const emailMessage =
      email === ""
        ? "Your email cannot be empty"
        : !emailValid
        ? "This email not valid"
        : null;
    const passwordMessage = !passwordValid
      ? "Your new password is not secure enough."
      : null;

    const validationResult = Object.assign(
      {},
      username === "" && { username: "Your username cannot be empty" },
      username &&
        username.length < 3 && { username: "Please choose a longer username" },
      emailMessage && { email: emailMessage },
      firstName === "" && { firstName: "Your first name cannot be empty" },
      lastName === "" && { lastName: "Your last name cannot be empty" },
      jobTitle === "" && { jobTitle: "Your job title cannot be empty" },
      passwordMessage && { password: passwordMessage }
    );

    setValidationErrors(validationResult);
    return validationResult;
  };

  const updateProfile = async () => {
    setupdateError("");
    const validationResults = await validateInfo();
    if (Object.keys(validationResults).length) {
      return;
    }
    const payload = {
      firstName,
      lastName,
      email,
      password,
      username,
      jobTitle,
      file: profileVideo
        ? {
            uri: profileVideo,
            name: "profileVideo.mp4",
            type: "video/mp4",
          }
        : null,
    };
    const formData = new FormData();
    const validValues = Object.keys(payload).filter((key) => {
      if (payload[key] === initialProfileData[key]) {
        return false;
      }
      // check if value is not null. Don't want to send null data to BE
      if (payload[key] !== null) {
        formData.append(key, payload[key]);
        return true;
      }
    });
    if (validValues.length) {
      setIsUpdating(true);
      const { success, other, response } = await apiCall(
        "POST",
        "/user/update/details",
        formData
      );
      setIsUpdating(false);

      if (success) {
        setShowUpdatedPill(true);

        setTimeout(() => {
          setShowUpdatedPill(false);
        }, 3000);

        setInitialProfileData(response);
      }
      if (!success) {
        if (other?.validationErrors) {
          setValidationErrors(other.validationErrors);
        } else {
          setupdateError(
            "Sorry, we couldn't update your details. Please check your connection and try again."
          );
        }
      }
    }
  };

  const checkUserExists = async (type, identifier) => {
    const { response, success } = await apiCall("POST", "/user/check/exists", {
      type,
      identifier,
      userId,
    });

    if (success && response[type]?.exists) {
      setValidationErrors({
        ...validationErrors,
        [type]: { exists: response[type].exists },
      });
    }

    if (
      success &&
      !response[type]?.exists &&
      Object.keys(validationErrors).length
    ) {
      const updatedValidationErrors = validationErrors;
      delete updatedValidationErrors[type];
      if (!Object.keys(updatedValidationErrors).length) {
        setValidationErrors({});
      } else {
        setValidationErrors(updatedValidationErrors);
      }
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const _userId = await getItemAsync("userId");

      setUserId(_userId);

      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === "granted");
      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      setHasAudioPermission(audioStatus.status === "granted");

      const { response, success } = await apiCall("GET", "/user/data");
      setLoading(false);
      if (success) {
        setInitialProfileData(response);
      } else {
        setupdateError(
          "An unexpected error ocurred. Please check your connection."
        );
      }
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

  if (loading) {
    return (
      <View>
        <View style={{ width: screenWidth, height: screenWidth }}>
          <ContentLoader active isProfileVideo />
        </View>
        <ContentLoader active isInput />
        <ContentLoader active isInput />
        <ContentLoader active isInput />
        <ContentLoader active isInput />
        <ContentLoader active isInput />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" && "padding"}
        style={{ flex: 1 }}
      >
        <View>
          {showUpdatedPill ? (
            <Text style={styles.newPostPill}>Profile Updated</Text>
          ) : null}
          <ScrollView style={{ marginBottom: 48 }}>
            <View style={styles.formContainer}>
              {(profileVideo && faceDetected) ||
              (!profileVideo && initialProfileData.profileVideoUrl) ? (
                <PreviewVideo
                  isFullWidth
                  uri={profileVideo || initialProfileData?.profileVideoUrl}
                  headers={initialProfileData?.profileVideoHeaders}
                />
              ) : profileVideo ? (
                <View>
                  <PreviewVideo isFullWidth uri={profileVideo} />
                  <View style={styles.faceDetectionError}>
                    <Text style={styles.faceDetectionErrorText}>
                      No face detected. Make sure your face is shown at the
                      start and end of your profile video.
                    </Text>
                    <TouchableOpacity onPress={() => setProfileVideo("")}>
                      <Text style={styles.resetProfileVideoText}>
                        Reset Profile Video
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
              <TouchableOpacity
                style={styles.takeVideoButton}
                onPress={() => {
                  setFaceDetected(false);
                  setCameraActivated(true);
                }}
              >
                <Text style={styles.takeVideoButtonText}>
                  <Ionicons name="videocam" size={14} /> Retake profile video
                </Text>
              </TouchableOpacity>
              <InputNoBorder
                label="Job title"
                value={
                  jobTitle !== null ? jobTitle : initialProfileData.jobTitle
                }
                setValue={setJobTitle}
                onChangeText={(v) => {
                  setJobTitle(v);
                  if (validationErrors.jobTitle) {
                    setValidationErrors({
                      ...validationErrors,
                      jobTitle: null,
                    });
                  }
                }}
                error={validationErrors?.jobTitle}
              />
              <InputNoBorder
                error={validationErrors?.firstName}
                label="First Name"
                value={
                  firstName !== null ? firstName : initialProfileData.firstName
                }
                setValue={setFirstName}
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
              <InputNoBorder
                error={validationErrors?.lastName}
                label="Last Name"
                value={
                  lastName !== null ? lastName : initialProfileData.lastName
                }
                setValue={setLastName}
                onChangeText={(v) => {
                  setLastName(v);
                  if (validationErrors.lastName) {
                    setValidationErrors({
                      ...validationErrors,
                      lastName: null,
                    });
                  }
                }}
              />
              <InputNoBorder
                error={
                  validationErrors?.username?.exists
                    ? "A user with this username already exists."
                    : validationErrors?.username
                }
                label="Username"
                value={
                  username !== null ? username : initialProfileData.username
                }
                setValue={setUsername}
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
              <InputNoBorder
                error={
                  validationErrors?.email?.exists
                    ? "A user with this email already exists."
                    : validationErrors?.email
                }
                label="Email"
                value={email !== null ? email : initialProfileData.email}
                setValue={setEmail}
                onChangeText={(v) => {
                  setEmail(v);
                  if (validationErrors.email) {
                    setValidationErrors({ ...validationErrors, email: null });
                  }
                }}
                onEndEditing={(e) =>
                  checkUserExists("email", e.nativeEvent.text)
                }
              />
              <View style={styles.textInputContainer}>
                <PasswordInputNoBorder
                  label={"Password"}
                  error={validationErrors?.password}
                  onChangeText={(v) => {
                    setPassword(v);
                    if (validationErrors?.password) {
                      let newValidationErrorsObj = validationErrors;
                      delete newValidationErrorsObj.password;
                      setValidationErrors(newValidationErrorsObj);
                      console.log(newValidationErrorsObj);
                    }
                  }}
                />
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
                    <Text style={styles.errorText}>
                      - Must container a number
                    </Text>
                  </View>
                ) : null}
              </View>
              {updateError ? (
                <Text style={styles.updateError}>{updateError}</Text>
              ) : null}
            </View>
          </ScrollView>
          <View
            style={[
              styles.submitButtonContainer,
              (profileVideo && !faceDetected) ||
                (Object.keys(validationErrors).length && { opacity: 0.3 }),
            ]}
          >
            <TouchableOpacity
              style={[styles.submitButton]}
              onPress={() => updateProfile()}
              disabled={
                (profileVideo && !faceDetected) ||
                Object.keys(validationErrors).length
              }
            >
              {isUpdating ? (
                <ActivityIndicator
                  size="large"
                  color={themeStyle.colors.primary.default}
                />
              ) : (
                <Ionicons
                  name="checkmark"
                  size={30}
                  color={themeStyle.colors.primary.light}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.colors.grayscale.highest,
  },
  formContainer: {
    paddingHorizontal: 20,
    backgroundColor: themeStyle.colors.grayscale.highest,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    marginBottom: 50,
  },
  newPostPill: {
    zIndex: 3, // works on ios
    elevation: 3, // works on android
    backgroundColor: themeStyle.colors.primary.default,
    color: themeStyle.colors.grayscale.lowest,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "center",
    position: "absolute",
    marginTop: statusBarHeight,
  },
  formHeader: {
    fontSize: 20,
  },
  updateError: {
    textAlign: "center",
    color: themeStyle.colors.error.default,
    fontWeight: "500",
  },
  resetProfileVideoText: {
    textAlign: "center",
    color: themeStyle.colors.grayscale.lowest,
  },
  faceDetectionError: {
    marginVertical: 20,
  },
  faceDetectionErrorText: {
    color: themeStyle.colors.error.default,
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 10,
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
  textInputContainer: {
    alignSelf: "stretch",
    marginBottom: 20,
  },
  submitButtonContainer: {
    width: "95%",
    backgroundColor: themeStyle.colors.grayscale.highest,
    borderWidth: 1,
    borderColor: themeStyle.colors.primary.light,
    position: "absolute",
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    zIndex: 1,
    alignSelf: "center",
  },
  submitButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 2,
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
    color: themeStyle.colors.grayscale.lowest,
  },
  label: {
    fontWeight: "700",
  },
  errorText: {
    fontSize: 12,
    color: themeStyle.colors.error.default,
  },
  visibleTextInputs: {
    fontSize: 15,
    height: 45,
    paddingHorizontal: 10,
    backgroundColor: themeStyle.colors.grayscale.lower,
  },
  searchBar: {
    flex: 1,
    color: themeStyle.colors.grayscale.lowest,
  },
  searchSection: {
    flexDirection: "row",
  },
  searchIcon: {
    padding: 10,
  },
  userResult: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});

export default EditUserDetailsScreen;
