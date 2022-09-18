import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
  Image,
  Modal,
} from "react-native";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { Camera } from "expo-camera";
import {
  Ionicons,
  FontAwesome5,
  AntDesign,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
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
import { detectFacesAsync } from "expo-face-detector";
import { getThumbnailAsync } from "expo-video-thumbnails";
// import Upload from "react-native-background-upload";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import openAppSettings from "../../../helpers/openAppSettings";
import { getInfoAsync } from "expo-file-system";
import webPersistUserData from "../../../helpers/webPersistUserData";
import getWebPersistedUserData from "../../../helpers/getWebPersistedData";
import CameraStandard from "../../../components/CameraStandard";
import convertVideoToMp4 from "../../../helpers/convertVideoToMp4";
import generateGif from "../../../helpers/generateGif";
import { FileSystemUploadType, uploadAsync } from "expo-file-system";

const { statusBarHeight } = Constants;
const EditUserDetailsScreen = () => {
  const { width: screenWidth } = Dimensions.get("window");
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userId, setUserId] = useState("");
  const [unFocussed, setUnFocussed] = useState(false);
  const [showProfileVideoOptions, setShowProfileVideoOptions] = useState(false);
  const [showProfileImageOptions, setShowProfileImageOptions] = useState(false);

  const [email, setEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [jobTitle, setJobTitle] = useState(null);
  const [jobTitleOptions, setJobTitleOptions] = useState([]);

  const [loadingVideo, setLoadingVideo] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});
  const [initialProfileData, setInitialProfileData] = useState({});
  const [detectingFaces, setDetectingFaces] = useState(false);

  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);

  const [profileVideoCameraActivated, setProfileVideoCameraActivated] =
    useState(false);
  const [profileImageCameraActivated, setProfileImageCameraActivated] =
    useState(false);

  const [recording, setRecording] = useState(false);
  const [recordingLength, setRecordingLength] = useState(30);

  const [faceDetected, setFaceDetected] = useState(false);

  const [profileVideo, setProfileVideo] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [prevProfileVideo, setPrevProfileVideo] = useState("");

  const [updateError, setUpdateError] = useState("");
  const [showVideoSizeError, setShowVideoSizeError] = useState(false);
  const [tooShort, setTooShort] = useState(false);
  const [tooLong, setTooLong] = useState(false);

  const [showUpdatedPill, setShowUpdatedPill] = useState(false);
  const [pickedFromCameraRoll, setPickedFromCameraRoll] = useState(false);
  const [gif, setGif] = useState("");

  const [typingStatus, setTypingStatus] = useState({
    name: "",
    typing: false,
    typingTimeout: 0,
  });

  const existingNativeUserData = useSelector((state) => state.userData);

  const userdata =
    Platform.OS === "web"
      ? { state: getWebPersistedUserData() }
      : existingNativeUserData;

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const pickProfileMedia = async (type = "video") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Unable access camera roll",
        `Please enable storage permissions to upload a profile ${type} from your local files.`,
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
        mediaTypes:
          type === "video"
            ? ImagePicker.MediaTypeOptions.Videos
            : ImagePicker.MediaTypeOptions.Images,
        quality: 0.3,
        allowsMultipleSelection: false,
        videoMaxDuration: 30,
        allowsEditing: false,
      });
      if (!result.cancelled) {
        setShowProfileImageOptions(false);
        setShowProfileVideoOptions(false);
        const mediaInfo = await getInfoAsync(result.uri);
        const mediaSizeInMb = mediaInfo.size / 1000000;
        if (mediaSizeInMb > 50) {
          setShowVideoSizeError(true);
          Alert.alert(
            `Unable to process this ${type}`,
            `This ${type} is too large. Please choose a ${type} that is 50MB or smaller in size.`,
            [
              {
                text: "Cancel",
              },
              {
                text: `Select Another ${type}`,
                onPress: () => pickProfileMedia(type),
              },
            ]
          );
          setLoading(false);
          return;
        }
        setFaceDetected(false);
        setDetectingFaces(false);
        setPickedFromCameraRoll(true);
        setShowVideoSizeError(false);
        if (type === "video") {
          setProfileVideo(result.uri);
        } else {
          setProfileImage(result.uri);
          await handleFaceDetection(0, result.uri);
          setProfileVideo("");
        }
      }
    }
  };

  const handleFaceDetection = async (duration, profileImageUri) => {
    if (!profileVideo && !profileImageUri) return;
    setLoadingVideo(!profileImageUri);
    setTooShort(false);
    setTooLong(false);
    setDetectingFaces(true);
    if (Number(duration) < 3000 && !profileImageUri) {
      // setProfileVideo(prevProfileVideo || initialProfileData?.profileVideoUrl);
      setDetectingFaces(false);
      setFaceDetected(false);
      setTooShort(true);
      setLoadingVideo(false);

      return;
    }
    if (Number(duration) > 30000 && !profileImageUri) {
      setDetectingFaces(false);
      setLoadingVideo(false);
      setTooLong(true);
      return;
    }
    setDetectingFaces(true);

    if (profileImageUri) {
      const { faces } = await detectFacesAsync(profileImageUri);

      if (faces?.length) {
        setFaceDetected(true);
      } else {
        setFaceDetected(false);
      }
      setDetectingFaces(false);
      return;
    }

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

  const getJobTitles = async (query) => {
    if (typingStatus.typingTimeout) {
      clearTimeout(typingStatus.typingTimeout);
    }
    setTypingStatus({
      name: query,
      typing: false,
      typingTimeout: setTimeout(async () => {
        const { response } = await apiCall("GET", `/jobs/search/${query}`);
        if (response?.length) {
          response.map((jobTitle) => {
            jobTitle.title = jobTitle?.title.replace(
              /(^\w{1})|(\s+\w{1})/g,
              (letter) => letter.toUpperCase()
            );
          });
          setJobTitleOptions(response.length <= 5 ? response : []);
        }
      }, 200),
    });
  };

  const validateInfo = async () => {
    if (tooShort || tooLong) return false;

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

  const handleSignedUploads = async (
    options,
    signedData,
    ignoreUpdateCall = false
  ) => {
    try {
      const response = await uploadAsync(options.url, options.path, {
        fieldName: "file",
        httpMethod: options.method,
        uploadType: FileSystemUploadType.BINARY_CONTENT,
      });
      if (response.status === 200) {
        if (!ignoreUpdateCall) {
          if (!unFocussed) {
            setIsUpdating(false);
          }
          const { success, response } = await apiCall(
            "POST",
            "/user/update/details",
            {
              flipProfileVideo:
                Platform.OS === "android" && !pickedFromCameraRoll,
              profileVideoKey: signedData?.profileVideoKey,
              profileImageKey: signedData?.profileImageKey,
              profileGifKey: signedData?.profileGifKey,
            }
          );
          if (!unFocussed) {
            if (!success) {
              setUpdateError(
                "Sorry, we could not update your details. Please try again later"
              );
            } else {
              setInitialProfileData(response);
              if (initialProfileData) {
                dispatch({
                  type: "SET_USER_DATA",
                  payload: {
                    ...initialProfileData,
                    ...response,
                  },
                });
                webPersistUserData({
                  ...initialProfileData,
                  ...response,
                });
              }
            }
          }
        }
      } else if (!unFocussed) {
        setUpdateError(
          "Sorry, we couldn't update your details. Please try again later"
        );
      }
    } catch (error) {
      console.log(error);
      setUpdateError(
        "Sorry, we couldn't update your details. Please try again later"
      );
    }
  };

  const updateProfile = async () => {
    setUpdateError("");

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
    };
    const validData = {};
    const validValues = Object.keys(payload).filter((key) => {
      if (payload[key] === initialProfileData[key]) {
        return false;
      }
      // check if value is not null. Don't want to send null data to BE
      if (payload[key] !== null) {
        validData[key] = payload[key];
        return true;
      }
    });
    if (
      validValues.length ||
      ((profileVideo || profileImage) && faceDetected)
    ) {
      setIsUpdating(true);
      const { success, other, response } = await apiCall(
        "POST",
        "/user/update/details",
        validData
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
          setUpdateError(
            "Sorry, we could not update your details. Please try again later."
          );
        }
      }

      const validVideoTypes = ["mp4", "webm"];
      const profileVideoUri = !validVideoTypes.includes(
        profileVideo?.split(".")[1]
      )
        ? await convertVideoToMp4(profileVideo)
        : profileVideo;

      const gifUri = profileVideo ? await generateGif(profileVideoUri) : null;

      if (profileVideo && !faceDetected) return;
      if (profileImage && !faceDetected) return;
      if (profileVideo && !gifUri) {
        setUpdateError(
          "Sorry, there was an issue processing your profile video. Please try again."
        );

        return;
      }
      const apiRoute = profileVideo
        ? "/files/signed-video-profile-upload-url"
        : "/files/signed-image-profile-upload-url";
      const { response: signedData, success: signedDataSuccess } =
        await apiCall("POST", apiRoute, {
          username: userdata?.state?.username || "",
          filename: (profileVideoUri || profileImage)?.replace(/^.*[\\\/]/, ""),
        });
      if (!signedDataSuccess) {
        setUpdateError(
          `Sorry, we could not update your ${
            profileVideo ? "profile video" : "profile image"
          }. Please try again later.`
        );
        return;
      }
      // get signed url
      // if successfully uploaded profile video, send flipproflilevideo plus the profile video key to backend

      if (gifUri) {
        const filePath =
          Platform.OS == "android" ? gifUri.replace("file://", "") : gifUri;
        const options = {
          url: signedData?.signedGifUrl,
          path: filePath, // path to file
          method: "PUT",
          type: "raw",
          maxRetries: 2, // set retry count (Android only). Default 2
          field: "file",
          // Below are options only supported on Android
          notification: {
            enabled: false,
          },
          useUtf8Charset: true,
          // customUploadId: post?._id,
        };

        await handleSignedUploads(options, signedData, true);
      }

      const filePath =
        Platform.OS == "android"
          ? (profileVideoUri || profileImage).replace("file://", "")
          : profileVideoUri || profileImage;

      const options = {
        url: signedData?.signedUrl,
        path: filePath, // path to file
        method: "PUT",
        type: "raw",
        maxRetries: 2, // set retry count (Android only). Default 2
        field: "file",
        // Below are options only supported on Android
        notification: {
          enabled: false,
        },
        useUtf8Charset: true,
        // customUploadId: post?._id,
      };
      await handleSignedUploads(options, signedData, false);
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
      const _userId =
        Platform.OS === "web"
          ? localStorage.getItem("userId")
          : await getItemAsync("userId");

      setUserId(_userId);
      if (Platform.OS !== "web") {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(cameraStatus.status === "granted");
        const audioStatus = await Camera.requestMicrophonePermissionsAsync();
        setHasAudioPermission(audioStatus.status === "granted");
      }
      const { response, success } = await apiCall("GET", "/user/data");
      setLoading(false);
      if (success) {
        setInitialProfileData(response);
      } else {
        setUpdateError("Something went wrong... Please try again later");
      }
    })();
    return () => {
      setHasCameraPermission(false);
      setHasAudioPermission(false);
      setUnFocussed(true);
    };
  }, []);

  useEffect(() => {
    if (profileVideoCameraActivated || profileImageCameraActivated) {
      navigation.setOptions({ headerShown: false });
    } else {
      navigation.setOptions({ headerShown: true });
    }
  }, [profileVideoCameraActivated, profileImageCameraActivated]);

  if (profileVideoCameraActivated && Platform.OS !== "web") {
    return (
      <ProfileVideoCamera
        setRecording={setRecording}
        setProfileVideo={(video) => {
          setPickedFromCameraRoll(false);
          setProfileVideo(video);
          setProfileImage("");
          setShowProfileImageOptions(false);
          setShowProfileVideoOptions(false);
        }}
        setCameraActivated={setProfileVideoCameraActivated}
        setRecordingLength={setRecordingLength}
        recording={recording}
        recordingLength={recordingLength}
        hasCameraPermission={hasCameraPermission}
        hasAudioPermission={hasAudioPermission}
      />
    );
  }

  if (profileImageCameraActivated) {
    return (
      <CameraStandard
        cameraActive={profileImageCameraActivated}
        recording={recording}
        disableVideo
        defaultCameraPosition="front"
        setCameraActive={setProfileImageCameraActivated}
        setFile={async (file) => {
          setProfileImage(file.uri);
          await handleFaceDetection(0, file.uri);
          setProfileVideo("");
          setShowProfileImageOptions(false);
          setShowProfileVideoOptions(false);
        }}
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
        <View style={{ height: "100%" }}>
          {showUpdatedPill ? (
            <Text style={styles.newPostPill}>
              {profileVideo && faceDetected ? "Updating..." : "Updated"}
            </Text>
          ) : null}

          <ScrollView
            style={{ marginBottom: 48 }}
            keyboardShouldPersistTaps="handled"
          >
            {!profileVideo &&
            !initialProfileData.profileVideoUrl &&
            !initialProfileData.profileImageUrl ? (
              <View style={{ width: "100%", alignItems: "center" }}>
                <Text
                  style={{
                    color: themeStyle.colors.grayscale.lowest,
                    fontWeight: "700",
                    textAlign: "center",
                    marginVertical: 20,
                    fontSize: 20,
                    marginHorizontal: 10,
                  }}
                >
                  {Platform.OS !== "web"
                    ? `Add a profile image or video to complete your profile.`
                    : "Add a profile image or video to complete your profile using the Magnet App."}
                </Text>
              </View>
            ) : null}
            <View style={styles.formContainer}>
              {Platform.OS !== "web" ? (
                <>
                  {profileImage ||
                  (!profileImage &&
                    !profileVideo &&
                    initialProfileData.profileImageUrl) ? (
                    <View>
                      <Image
                        source={{
                          uri:
                            profileImage || initialProfileData?.profileImageUrl,
                          headers: initialProfileData?.profileImageHeaders,
                        }}
                        style={{
                          height: screenWidth,
                          width: screenWidth,
                          aspectRatio: 1,
                        }}
                      />
                      {profileImage && !faceDetected ? (
                        <Text style={styles.faceDetectionError}>
                          Face was not fully detected. Please make sure your
                          face is shown in your profile image.
                        </Text>
                      ) : null}
                    </View>
                  ) : (profileVideo && faceDetected) ||
                    (!profileVideo &&
                      initialProfileData.profileVideoUrl &&
                      !profileImage) ? (
                    <View>
                      <PreviewVideo
                        onLoad={(info) =>
                          handleFaceDetection(info?.durationMillis)
                        }
                        flipProfileVideo={
                          profileVideo && !loadingVideo
                            ? !!(
                                Platform.OS === "android" &&
                                !pickedFromCameraRoll
                              )
                            : !!initialProfileData.flipProfileVideo
                        }
                        isFullWidth
                        uri={
                          profileVideo || initialProfileData?.profileVideoUrl
                        }
                        headers={initialProfileData?.profileVideoHeaders}
                      />
                      {!detectingFaces &&
                      !loadingVideo &&
                      !faceDetected &&
                      profileVideo ? (
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
                      {profileVideo || profileImage ? (
                        <TouchableOpacity
                          style={{ marginVertical: 10 }}
                          onPress={() => {
                            setProfileVideo("");
                            setProfileImage("");
                            setFaceDetected(true);
                            setDetectingFaces(false);
                            setLoadingVideo(false);
                            setTooShort(false);
                            setTooLong(false);
                          }}
                        >
                          <Text style={styles.resetProfileVideoText}>
                            Reset
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ) : profileVideo ? (
                    <View>
                      <PreviewVideo
                        onLoad={(info) =>
                          handleFaceDetection(info?.durationMillis)
                        }
                        isFullWidth
                        flipProfileVideo={
                          Platform.OS === "android" &&
                          profileVideo &&
                          !pickedFromCameraRoll
                        }
                        uri={profileVideo}
                      />
                      <View style={styles.faceDetectionError}>
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
                        <TouchableOpacity
                          style={{ marginVertical: 10 }}
                          onPress={() => setProfileVideo("")}
                        >
                          <Text style={styles.resetProfileVideoText}>
                            Reset
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : null}
                </>
              ) : null}
              {Platform.OS !== "web" ? (
                <View>
                  <Modal
                    visible={showProfileVideoOptions || showProfileImageOptions}
                    onRequestClose={() => {
                      setShowProfileImageOptions(false);
                      setShowProfileVideoOptions(false);
                    }}
                  >
                    <SafeAreaView
                      style={{
                        flex: 1,
                        backgroundColor: themeStyle.colors.grayscale.highest,
                      }}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: themeStyle.colors.grayscale.highest,
                          flex: 1,
                        }}
                      >
                        <View
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            zIndex: 10,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              setShowProfileImageOptions(false);
                              setShowProfileVideoOptions(false);
                            }}
                          >
                            <AntDesign
                              name="close"
                              size={24}
                              color={themeStyle.colors.white}
                              style={{
                                color: themeStyle.colors.white,
                                textShadowOffset: {
                                  width: 1,
                                  height: 1,
                                },
                                textShadowRadius: 8,
                                textShadowColor: themeStyle.colors.black,
                              }}
                            />
                          </TouchableOpacity>
                        </View>
                        {showProfileImageOptions ? (
                          <>
                            <Text
                              style={{
                                textAlign: "center",
                                color: themeStyle.colors.grayscale.lowest,
                                marginBottom: 30,
                                fontSize: 20,
                              }}
                            >
                              Upload or take a profile image.
                            </Text>
                            <TouchableOpacity
                              style={[styles.takeVideoButton]}
                              onPress={() => {
                                setFaceDetected(false);
                                setProfileImageCameraActivated(true);
                              }}
                            >
                              <View
                                style={{
                                  height: screenWidth / 3,
                                  width: screenWidth / 3,
                                  alignItems: "center",
                                  justifyContent: "space-evenly",
                                }}
                              >
                                <Text style={[styles.takeVideoButtonText]}>
                                  <Entypo
                                    name="camera"
                                    size={40}
                                    color={themeStyle.colors.grayscale.lowest}
                                  />{" "}
                                </Text>
                                <Text
                                  style={{
                                    textAlign: "center",
                                    color: themeStyle.colors.grayscale.lowest,
                                  }}
                                >
                                  Capture
                                </Text>
                              </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.takeVideoButton]}
                              onPress={() => {
                                setRecordingLength(30);
                                pickProfileMedia("image");
                              }}
                            >
                              <View
                                style={{
                                  height: screenWidth / 3,
                                  width: screenWidth / 3,
                                  alignItems: "center",
                                  justifyContent: "space-evenly",
                                }}
                              >
                                <Text style={[styles.takeVideoButtonText]}>
                                  <FontAwesome5
                                    name="images"
                                    size={40}
                                    color={themeStyle.colors.grayscale.lowest}
                                  />{" "}
                                </Text>
                                <Text
                                  style={{
                                    textAlign: "center",
                                    color: themeStyle.colors.grayscale.lowest,
                                  }}
                                >
                                  Upload
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <>
                            <Text
                              style={{
                                textAlign: "center",
                                color: themeStyle.colors.grayscale.lowest,
                                marginBottom: 30,
                                fontSize: 20,
                              }}
                            >
                              Upload or record a profile video.
                            </Text>
                            <TouchableOpacity
                              style={styles.takeVideoButton}
                              onPress={() => {
                                setFaceDetected(false);
                                setProfileVideoCameraActivated(true);
                                setRecordingLength(30);
                              }}
                            >
                              <View
                                style={{
                                  height: screenWidth / 3,
                                  width: screenWidth / 3,
                                  alignItems: "center",
                                  justifyContent: "space-evenly",
                                }}
                              >
                                <Text style={styles.takeVideoButtonText}>
                                  <Ionicons name="videocam" size={40} />
                                </Text>
                                <Text
                                  style={{
                                    textAlign: "center",
                                    color: themeStyle.colors.grayscale.lowest,
                                  }}
                                >
                                  Record
                                </Text>
                              </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.takeVideoButton}
                              onPress={() => {
                                setRecordingLength(30);
                                pickProfileMedia("video");
                              }}
                            >
                              <View
                                style={{
                                  height: screenWidth / 3,
                                  width: screenWidth / 3,
                                  alignItems: "center",
                                  justifyContent: "space-evenly",
                                }}
                              >
                                <Text style={styles.takeVideoButtonText}>
                                  <FontAwesome5
                                    name="images"
                                    size={40}
                                    color={themeStyle.colors.grayscale.lowest}
                                  />{" "}
                                </Text>
                                <Text
                                  style={{
                                    textAlign: "center",
                                    color: themeStyle.colors.grayscale.lowest,
                                  }}
                                >
                                  Upload
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </SafeAreaView>
                  </Modal>
                  <TouchableOpacity
                    style={[styles.takeVideoButton]}
                    onPress={() => {
                      setShowProfileImageOptions(true);
                    }}
                  >
                    <Text style={[styles.takeVideoButtonText]}>
                      <Ionicons
                        name="videocam"
                        size={14}
                        color={themeStyle.colors.grayscale.lowest}
                      />{" "}
                      Add profile photo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.takeVideoButton]}
                    onPress={() => {
                      setShowProfileVideoOptions(true);
                    }}
                  >
                    <Text style={[styles.takeVideoButtonText]}>
                      <Ionicons
                        name="videocam"
                        size={14}
                        color={themeStyle.colors.grayscale.lowest}
                      />{" "}
                      Add profile video
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ marginVertical: 20 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      textAlign: "center",
                      fontWeight: "700",
                      color: themeStyle.colors.grayscale.lowest,
                    }}
                  >
                    Download the{" "}
                    <Text
                      style={{ color: themeStyle.colors.primary.default }}
                      onPress={async () => {
                        const canOpen = await Linking.canOpenURL("/");
                        if (canOpen) {
                          Linking.openURL("/");
                        }
                      }}
                    >
                      Magnet App
                    </Text>{" "}
                    to add a profile image or video.
                  </Text>
                </View>
              )}
              <InputNoBorder
                maxLength={40}
                error={validationErrors?.firstName}
                label="First Name"
                value={
                  firstName !== null ? firstName : initialProfileData.firstName
                }
                setValue={setFirstName}
                onChangeText={(v) => {
                  setFirstName(v);
                  if (validationErrors.firstName) {
                    const updatedValidationErrors = validationErrors;
                    delete updatedValidationErrors.firstName;
                    setValidationErrors(updatedValidationErrors);
                  }
                }}
              />
              <InputNoBorder
                maxLength={40}
                error={validationErrors?.lastName}
                label="Last Name"
                value={
                  lastName !== null ? lastName : initialProfileData.lastName
                }
                setValue={setLastName}
                onChangeText={(v) => {
                  setLastName(v);
                  if (validationErrors.lastName) {
                    const updatedValidationErrors = validationErrors;
                    delete updatedValidationErrors.lastName;
                    setValidationErrors(updatedValidationErrors);
                  }
                }}
              />
              <View style={{ width: "100%" }}>
                {jobTitleOptions?.length ? (
                  <ScrollView
                    style={{
                      position: "absolute",
                      bottom: 90,
                      zIndex: 999,
                      backgroundColor: themeStyle.colors.grayscale.higher,
                      paddingHorizontal: 10,
                      width: "100%",
                    }}
                    keyboardShouldPersistTaps="handled"
                  >
                    <View>
                      {jobTitleOptions.map((item, i) => (
                        <TouchableOpacity
                          style={{
                            height: 48,
                            justifyContent: "center",
                            borderTopColor: themeStyle.colors.grayscale.highest,
                            borderTopWidth: i > 0 ? 1 : 0,
                            zIndex: 999,
                          }}
                          key={`${item._id}-${i}`}
                          onPress={() => {
                            setJobTitle(item.title);
                            setJobTitleOptions([]);
                          }}
                        >
                          <Text
                            style={{
                              color: themeStyle.colors.grayscale.lowest,
                            }}
                          >
                            {item.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                ) : null}
                <InputNoBorder
                  maxLength={40}
                  label="Job title"
                  value={
                    jobTitle !== null ? jobTitle : initialProfileData.jobTitle
                  }
                  setValue={setJobTitle}
                  onChangeText={(v) => {
                    if (!v) {
                      setJobTitleOptions([]);
                    }
                    setJobTitle(v);
                    getJobTitles(v);
                    if (validationErrors.jobTitle) {
                      const updatedValidationErrors = validationErrors;
                      delete updatedValidationErrors.jobTitle;
                      setValidationErrors(updatedValidationErrors);
                    }
                  }}
                  error={validationErrors?.jobTitle}
                  onBlur={() => setJobTitleOptions([])}
                  onEndEditing={() => setJobTitleOptions([])}
                  onClear={() => setJobTitleOptions([])}
                />
              </View>
              <InputNoBorder
                maxLength={30}
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
                    const updatedValidationErrors = validationErrors;
                    delete updatedValidationErrors.username;
                    setValidationErrors(updatedValidationErrors);
                  }
                }}
                onEndEditing={(e) =>
                  checkUserExists("username", e.nativeEvent.text)
                }
              />
              <InputNoBorder
                maxLength={200}
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
                    const updatedValidationErrors = validationErrors;
                    delete updatedValidationErrors.email;
                    setValidationErrors(updatedValidationErrors);
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
              (((profileVideo || profileImage) && !faceDetected) ||
                Object.keys(validationErrors).length ||
                detectingFaces ||
                loadingVideo) && { opacity: 0.3 },
            ]}
          >
            <TouchableOpacity
              style={[styles.submitButton]}
              onPress={() => updateProfile()}
              disabled={
                ((profileVideo || profileImage) && !faceDetected) ||
                Object.keys(validationErrors).length ||
                detectingFaces ||
                loadingVideo
              }
            >
              {isUpdating && (profileVideo || profileImage) ? (
                <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                  Updating...
                </Text>
              ) : isUpdating ? (
                <ActivityIndicator
                  size="small"
                  color={themeStyle.colors.white}
                />
              ) : (
                <Text
                  style={{
                    color: themeStyle.colors.white,
                    fontWeight: "700",
                  }}
                >
                  Update details
                </Text>
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
    color: themeStyle.colors.secondary.default,
  },
  faceDetectionError: {
    color: themeStyle.colors.error.default,
    textAlign: "center",
    fontWeight: "700",
    marginVertical: 20,
    marginHorizontal: 10,
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
    width: "98%",
    backgroundColor: themeStyle.colors.primary.default,
    position: "absolute",
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    zIndex: 1,
    alignSelf: "center",
    borderRadius: 5,
  },
  submitButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  takeVideoButton: {
    margin: 10,
    padding: 10,
    borderWidth: 3,
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
