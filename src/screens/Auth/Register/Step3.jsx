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
  Image,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Camera } from "expo-camera";
import { Ionicons, FontAwesome5, AntDesign, Entypo } from "@expo/vector-icons";
import { getExpoPushTokenAsync } from "expo-notifications";
import themeStyle from "../../../theme.style";
import apiCall from "../../../helpers/apiCall";
import ProfileVideoCamera from "../../../components/ProfileVideoCamera";
import { useSelector, useDispatch } from "react-redux";
import PreviewVideo from "../../../components/PreviewVideo";
import { detectFacesAsync } from "expo-face-detector";
import { getThumbnailAsync } from "expo-video-thumbnails";
import AnimatedLottieView from "lottie-react-native";
// import Upload from "react-native-background-upload";
import * as ImagePicker from "expo-image-picker";
import openAppSettings from "../../../helpers/openAppSettings";
import { getInfoAsync } from "expo-file-system";
import Constants from "expo-constants";
import webPersistUserData from "../../../helpers/webPersistUserData";
import getWebPersistedUserData from "../../../helpers/getWebPersistedData";
import CameraStandard from "../../../components/CameraStandard";
import generateGif from "../../../helpers/generateGif";
import convertVideoToMp4 from "../../../helpers/convertVideoToMp4";
import { FileSystemUploadType, uploadAsync } from "expo-file-system";
import PreviewProfileImage from "../../../components/PreviewProfileImage";
const Step1Screen = () => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);

  const [showProfileVideoOptions, setShowProfileVideoOptions] = useState(false);
  const [showProfileImageOptions, setShowProfileImageOptions] = useState(false);

  const [profileVideoCameraActivated, setProfileVideoCameraActivated] =
    useState(false);
  const [profileImageCameraActivated, setProfileImageCameraActivated] =
    useState(false);

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
  const [profileImage, setProfileImage] = useState("");

  const [loadingVideo, setLoadingVideo] = useState(false);

  const [skipProfileVideo, setSkipProfileVideo] = useState(false);

  const [pickedFromCameraRoll, setPickedFromCameraRoll] = useState(false);

  const [registrationError, setRegistrationError] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const existingNativeUserData = useSelector((state) => state.userData);

  const existingInfo =
    Platform.OS === "web"
      ? { state: getWebPersistedUserData() }
      : existingNativeUserData;

  const profileMediaIsValid = () => {
    if (profileImage && !profileVideo && faceDetected) return true;
    if (tooShort || tooLong) return false;
    if (profileVideo && faceDetected) {
      return true;
    }
    if (skipProfileVideo) {
      return true;
    }
    return false;
  };

  const handleSignedUploads = async (
    options,
    signedData,
    ignoreUpdateCall = false,
    notificationToken
  ) => {
    try {
      const uploadResponse = await uploadAsync(options.url, options.path, {
        fieldName: "file",
        httpMethod: options.method,
        uploadType: FileSystemUploadType.BINARY_CONTENT,
      });
      if (!ignoreUpdateCall) {
        if (uploadResponse.status === 200) {
          const { success } = await apiCall("POST", `/user/register`, {
            ...existingInfo.state,
            notificationToken,
            flipProfileVideo:
              Platform.OS === "android" && !pickedFromCameraRoll,
            profileVideoKey: signedData.profileVideoKey,
            profileGifKey: signedData.profileGifKey,
            profileImageKey: signedData.profileImageKey,
          });
          if (success) {
            dispatch({
              type: "SET_USER_DATA",
              payload: {},
            });
            webPersistUserData({});
            setTimeout(
              () =>
                navigation.navigate("Login", {
                  newlyRegisteredCredentials: {
                    username: existingInfo?.state?.username,
                    password: existingInfo?.state?.password,
                  },
                }),
              300
            );
          } else {
            setRegistrationError(
              "We could not create your account. Please try again later."
            );
          }
        } else {
          setRegistrationError(
            `We could not upload your profile ${
              profileImage ? "image" : "video"
            }. Please try again later.`
          );
        }
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      setRegistrationError(
        `We could not upload your profile ${
          profileImage ? "image" : "video"
        }. Please try again later.`
      );
    }
  };

  const sendUserData = async (notificationToken) => {
    setLoading(true);
    const profileVideoUri = await convertVideoToMp4(profileVideo);
    const gifUri = profileVideo ? await generateGif(profileVideoUri) : null;

    const { response, success } = await apiCall(
      "POST",
      "/user/verify-registeration-details",
      {
        ...existingInfo.state,
        notificationToken,
        profileVideoFileName: profileVideoUri
          ? profileVideoUri.replace(/^.*[\\/]/, "")
          : "",
        profileGifFileName: gifUri ? gifUri.replace(/^.*[\\/]/, "") : "",
        profileImageFileName: profileImage
          ? profileImage.replace(/^.*[\\/]/, "")
          : "",
        flipProfileVideo: (
          Platform.OS === "android" && !pickedFromCameraRoll
        ).toString(), //TODO check if we still need to convert to string
      }
    );
    if (!success) {
      setRegistrationError(
        "We could not verify your registration details. Please try again later."
      );
      return;
    }
    const filePath =
      Platform.OS == "android"
        ? (profileVideoUri || profileImage).replace("file://", "")
        : profileVideoUri || profileImage;
    if (notificationToken) {
      if (gifUri) {
        const filePath =
          Platform.OS == "android" ? gifUri.replace("file://", "") : gifUri;
        const options = {
          url: response?.signedProfileGifUploadUrl,
          path: filePath, // path to file
          method: "PUT",
        };

        await handleSignedUploads(options, response, true, notificationToken);
      }

      const options = {
        url: profileVideoUri
          ? response.signedProfileVideoUploadUrl
          : response.signedProfileImageUploadUrl,
        path: filePath, // path to file
        method: "PUT",
      };

      await handleSignedUploads(options, response, false, notificationToken);
    }
  };

  const registerUser = async () => {
    const { data: notificationToken } = await getExpoPushTokenAsync({
      experienceId: Constants.manifest.extra.experienceId,
    });
    const apiUrl = Constants.manifest.extra.apiUrl;

    setRegistrationError("");
    if ((profileVideo || profileImage) && !skipProfileVideo) {
      await sendUserData(apiUrl, notificationToken);
    } else {
      setVerifying(true);
      const { response, success, message } = await apiCall(
        "POST",
        `/user/register`,
        {
          ...existingInfo.state,
          notificationToken,
          flipProfileVideo: Platform.OS === "android" && !pickedFromCameraRoll,
        }
      );
      setVerifying(false);

      if (success) {
        dispatch({
          type: "SET_USER_DATA",
          payload: {},
        });
        webPersistUserData({});
        setTimeout(
          () =>
            navigation.navigate("Login", {
              newlyRegisteredCredentials: {
                username: existingInfo?.state?.username,
                password: existingInfo?.state?.password,
              },
            }),
          300
        );
      } else {
        setRegistrationError("An error occurred. Please try again.");
      }
    }
  };

  const handleFaceDetection = async (duration, profileImageUri) => {
    setLoadingVideo(true);
    setTooShort(false);
    setTooLong(false);
    setDetectingFaces(true);
    if (Number(duration) < 3000 && !profileImageUri) {
      setDetectingFaces(false);
      setLoadingVideo(false);
      setTooShort(true);
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
    } else {
      // try to detect face again but towards the end of the video
      const { uri } = await getThumbnailAsync(profileVideo, {
        time: Number(duration) - 1000,
      });
      const { faces } = await detectFacesAsync(uri);
      setFaceDetected(!!faces?.length);
    }
    setDetectingFaces(false);
    setLoadingVideo(false);
  };

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
  }, [profileVideoCameraActivated]);

  useEffect(() => {
    if (profileVideoCameraActivated || profileImageCameraActivated || loading) {
      navigation.setOptions({ headerShown: false });
    } else {
      navigation.setOptions({ headerShown: true });
    }
  }, [profileVideoCameraActivated, profileImageCameraActivated, loading]);

  if (loading && !registrationError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            color: themeStyle.colors.primary.default,
            fontSize: 24,
            fontWeight: "700",
            marginBottom: 40,
          }}
        >
          Creating your account
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontSize: 16,
            color: themeStyle.colors.grayscale.lowest,
            fontWeight: "700",
          }}
        >
          Just setting some things up for you... {"\n"}
          {profileImage || profileVideo ? (
            <Text style={{ fontSize: 12 }}>
              {profileImage
                ? "(This should takes less than 5 seconds.)"
                : "(This usually takes less than 15 seconds.)"}
            </Text>
          ) : null}
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

  if (profileVideoCameraActivated) {
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
          handleFaceDetection(0, file.uri);
          setProfileVideo("");
          setShowProfileImageOptions(false);
          setShowProfileVideoOptions(false);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ marginBottom: 0 }}>
        <View style={styles.formContainer}>
          <Text
            style={[styles.signupText, skipProfileVideo && { opacity: 0.1 }]}
          >
            A face for your account
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
            Build quality connections by adding a profile image or video.
          </Text>
          <Modal
            visible={showHelpModal}
            onRequestClose={() => setShowHelpModal(false)}
            animationType={"slide"}
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
                  style={{
                    opacity: skipProfileVideo ? 0.1 : 1,
                    height: 48,
                    width: 48,
                    alignItems: "flex-end",
                  }}
                >
                  <Ionicons
                    name="close"
                    size={30}
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

          {profileImage && !skipProfileVideo ? (
            <View>
              <PreviewProfileImage url={profileImage} />
              {!detectingFaces && !faceDetected ? (
                <Text style={styles.faceDetectionError}>
                  Face was not fully detected. Please make sure your face is
                  shown in your profile image.
                </Text>
              ) : null}
            </View>
          ) : profileVideo && faceDetected && !skipProfileVideo ? (
            <View>
              <PreviewVideo
                uri={profileVideo}
                isFullWidth
                flipProfileVideo={
                  Platform.OS === "android" && !pickedFromCameraRoll
                }
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
                flipProfileVideo={
                  Platform.OS === "android" && !pickedFromCameraRoll
                }
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
                        style={{
                          height: 48,
                          width: 48,
                          alignItems: "flex-end",
                        }}
                      >
                        <AntDesign
                          name="close"
                          size={30}
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
              <View style={{ marginTop: 20 }}>
                <TouchableOpacity
                  style={[
                    styles.takeVideoButton,
                    skipProfileVideo && {
                      opacity: 0.1,
                    },
                  ]}
                  disabled={skipProfileVideo}
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
                  style={[
                    styles.takeVideoButton,
                    skipProfileVideo && {
                      opacity: 0.1,
                    },
                  ]}
                  disabled={skipProfileVideo}
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

          {!skipProfileVideo ? (
            <TouchableOpacity
              disabled={skipProfileVideo}
              style={{ opacity: skipProfileVideo ? 0.1 : 1, marginTop: 20 }}
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
              styles.registrationButton,
              {
                opacity:
                  !profileMediaIsValid() || (profileVideo && loadingVideo)
                    ? 0.5
                    : 1,
                minWidth: 100,
                alignItems: "center",
              },
            ]}
            onPress={() => registerUser()}
            disabled={
              !profileMediaIsValid() ||
              (profileVideo && loadingVideo) ||
              verifying
            }
          >
            {!verifying ? (
              <Text style={styles.registrationButtonText}>
                Sign Up <Ionicons name="paper-plane-outline" size={14} />
              </Text>
            ) : (
              <ActivityIndicator
                size={"small"}
                animating
                color={themeStyle.colors.white}
              />
            )}
          </TouchableOpacity>
          {skipProfileVideo ? (
            <TouchableOpacity
              style={{ marginTop: 20 }}
              onPress={() => setSkipProfileVideo(false)}
            >
              <Text
                style={{
                  color: themeStyle.colors.secondary.default,
                  fontWeight: "700",
                  marginVertical: 20,
                }}
              >
                No, I want to add a face
              </Text>
            </TouchableOpacity>
          ) : null}
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
          {registrationError ? (
            <Text style={styles.registrationError}>{registrationError}</Text>
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
  registrationError: {
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
  registrationButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 20,
    borderRadius: 50,
    backgroundColor: themeStyle.colors.primary.default,
  },
  registrationButtonText: {
    color: themeStyle.colors.white,
  },
  takeVideoButton: {
    margin: 10,
    padding: 10,
    borderWidth: 3,
    borderColor: themeStyle.colors.primary.default,
    borderRadius: 5,
  },
  uploadVideoButton: {
    margin: 10,
    padding: 10,
    borderWidth: 3,
    borderColor: themeStyle.colors.primary.default,
    borderRadius: 5,
  },
  takeVideoButtonText: {
    color: themeStyle.colors.grayscale.lowest,
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
    fontSize: 14,
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
    fontSize: 14,
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
    textAlign: "center",
  },
  helpModalListItem: {
    fontWeight: "700",
    fontSize: 14,
    color: themeStyle.colors.grayscale.lowest,
  },
});
export default React.memo(Step1Screen);
