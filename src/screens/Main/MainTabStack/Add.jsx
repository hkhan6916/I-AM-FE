import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
  Keyboard,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import themeStyle from "../../../theme.style";
import apiCall from "../../../helpers/apiCall";
import CameraStandard from "../../../components/CameraStandard";
import ImageWithCache from "../../../components/ImageWithCache";
import * as ImagePicker from "expo-image-picker";
import { getInfoAsync } from "expo-file-system";
import {
  Image as ImageCompress,
  backgroundUpload as compressorUpload,
} from "react-native-compressor";
import VideoPlayer from "expo-video-player";
import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { getThumbnailAsync } from "expo-video-thumbnails";
import { StatusBar } from "expo-status-bar";
import GifModal from "../../../components/GifModal";
import openAppSettings from "../../../helpers/openAppSettings";
import backgroundUpload from "../../../helpers/backgroundUpload";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import { convertAndEncodeVideo } from "../../../helpers/convertAndEncodeVideo";
import { useSelector } from "react-redux";
import getVideoCodecName from "../../../helpers/getVideoCodecName";
import { FFmpegKit } from "ffmpeg-kit-react-native";
import { launchImageLibraryAsync } from "expo-image-picker";
import ActionSheet from "react-native-actions-sheet";
import { Video } from "expo-av";
import { openDatabase } from "expo-sqlite";
import {
  createRunningUploadsTable,
  deleteRunningUploadRecord,
  getRunningUploads,
  insertRunningUploadRecord,
} from "../../../helpers/sqlite/runningUploads";
import * as Notifications from "expo-notifications";
import queue, { Worker } from "react-native-job-queue";
import { Camera } from "react-native-vision-camera";
import { LinearGradient } from "expo-linear-gradient";
import { GPTPromptModal } from "../../../components/GPTPromptModal";

const AddScreen = () => {
  const isFocused = useIsFocused();
  const [postBody, setPostBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState({});
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showMediaSizeError, setShowMediaSizeError] = useState(false);
  const [showGifsModal, setShowGifsModal] = useState(false);
  const [gif, setGif] = useState("");
  const [gifPreview, setGifPreview] = useState("");
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [thumbnail, setThumbnail] = useState("");
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [processedVideoUri, setProcessedVideoUri] = useState("");
  const [processingFile, setProcessingFile] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState("");
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [showImageOrVideoOption, setShowImageOrVideoOption] = useState(false);
  const [enableAI, setEnableAI] = useState(false);

  const navigation = useNavigation();

  const videoRef = useRef(null);
  const actionSheetRef = useRef(null);

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const dispatch = useDispatch();

  const isLowendDevice = useSelector((state) => state.isLowEndDevice)?.state;
  const createPostData = async () => {
    let postData = {};
    if (postBody) {
      // upload any text body if there is an
      postData.postBody = postBody;
    }
    if (gif) {
      // if there's a gif, skip everything and just upload the gif
      postData.gif = gif;
      postData.gifPreview = gifPreview;
      return postData;
    }
    if (generatedImageUrl) {
      // if there's a generatedImageUrl, skip everything and just upload the generatedImageUrl
      postData.generatedImageUrl = generatedImageUrl;
      return postData;
    }
    if (file.uri) {
      // if there's a file, determine if compression is required
      const { type, uri, isSelfie } = file;
      if (type.split("/")[0] === "video") {
        // just adds thumbnail for videos. We add the rest of the media later.
        const thumbnailFormat = "jpg";

        // get signed url for uploading thumbnail
        const { response, success } = await apiCall(
          "POST",
          "/files/signed-upload-url",
          { filename: `mediaThumbnail.${thumbnailFormat}` }
        );
        if (!success) {
          setError(
            "Sorry, we could not upload the selected media. Please try again later."
          );
          setLoading(false);
          return;
        }
        postData.mimetype = thumbnailFormat;
        postData.mediaKey = response.fileKey; // This is the thumbnail. We send this to backend which saves it as the thumbnailkey for this post,
        postData.mediaType = "video";
        postData.mediaIsSelfie = isSelfie || false;
        postData.height = height;
        postData.width = width;
        postData.thumbnailSignedUrl = response.signedUrl;
        postData.videoEncoding = file.encoding;
      } else {
        const mediaInfo = await getInfoAsync(uri);
        const mediaSizeInMb = mediaInfo?.size / 100000;

        const format = uri.split(".").pop();
        await ImageCompress.compress(
          uri,
          {
            compressionMethod: "auto",
            minimumFileSizeForCompress: 3,
          },
          (progress) => {
            console.log({ image_compression: progress });
          }
        );
        if (mediaSizeInMb > (isLowendDevice ? 50 : 100)) {
          return null;
        }
        const { response, success } = await apiCall(
          "POST",
          "/files/signed-upload-url",
          { filename: `media.${format}` }
        );
        if (!success) {
          setError(
            "Sorry, we could not upload the selected media. Please try again later."
          );
          setLoading(false);

          return;
        }
        postData.height = height;
        postData.width = width;
        postData.mimetype = format;
        postData.mediaKey = response.fileKey;
        postData.mediaType = "image";
        postData.mediaIsSelfie = isSelfie || false;
        await backgroundUpload({
          // TODO: try axios here
          filePath: uri,
          url: response.signedUrl,
        });
      }
    }

    return postData;
  };

  const generateThumbnail = async (path, duration) => {
    const videoDurationMs = (duration || 0) / 1000;

    try {
      const { uri } = await getThumbnailAsync(path || file.uri, {
        time: videoDurationMs > 1 ? 1 : 0,
        quality: 0.5,
      });
      return uri;
    } catch (e) {
      console.warn(e);
    }
  };

  const handlePostCreation = async () => {
    setError("");
    setLoading(true);
    const postData = await createPostData();

    if (!postData) return;
    const { success, response } = await apiCall("POST", "/posts/new", postData);
    setLoading(false);
    if (success) {
      setThumbnail("");
      setGif("");
      if (!response.post) return;
      setPostBody("");
      if (Platform.OS === "android" && file.type?.split("/")[0] === "video") {
        const db = openDatabase("localdb");

        await createRunningUploadsTable(db);
        await insertRunningUploadRecord({
          db,
          postId: response.post._id,
        });
      }
      if (file.type?.split("/")[0] === "video") {
        dispatch({
          type: "SET_POST_CREATED",
          payload: { posted: true, type: "created" },
        });
        if (Platform.OS === "ios") {
          await handleVideoCompressionAndUpload({
            post: response.post,
            file,
            thumbnailSignedUrl: postData.thumbnailSignedUrl,
          });
        } else {
          queue.addJob("post_video_upload", {
            post: response.post,
            file,
            thumbnailSignedUrl: postData.thumbnailSignedUrl,
          });
          Keyboard.dismiss();
          navigation.navigate("Home");
        }
        setFile({});
        setGif("");
        setGeneratedImageUrl("");
        setThumbnail("");
        setCompressionProgress(0);
        setProcessingFile(false);
        setSelectedMediaType("");
      } else {
        setFile({});
        setGif("");
        setGeneratedImageUrl("");
        setThumbnail("");
        setCompressionProgress(0);
        setProcessingFile(false);
        setSelectedMediaType("");
        dispatch({
          type: "SET_POST_CREATED",
          payload: { posted: true, type: "created" },
        });
        Keyboard.dismiss();
        navigation.navigate("Home");
      }
    } else {
      setLoading(false);
      setError(
        "An error occurred when creating your post. Please try again, or check your connection."
      );
    }
  };

  const handleVideoCompressionAndUpload = async ({
    post,
    file,
    thumbnailSignedUrl,
  }) => {
    if (!file?.uri) return;
    const thumbnailUri = await generateThumbnail(file.uri, file.duration);
    if (!thumbnailUri) {
      setError(
        "Something went wrong when creating your post. Please try again."
      );
      return;
    }
    // upload the thumbnail for the video
    await backgroundUpload({
      filePath: thumbnailUri,
      url: thumbnailSignedUrl,
    });

    if (Platform.OS === "ios") {
      Keyboard.dismiss();
      navigation.navigate("Home");
    }

    const convertedCodecAndCompressedUrl =
      Platform.OS === "ios"
        ? processedVideoUri
        : await convertAndEncodeVideo({
            uri: file.uri,
            setProgress: setCompressionProgress,
            videoDuration,
          });

    const { response: signedData, success } = await apiCall(
      "POST",
      "/files/signed-upload-url",
      { filename: `media.${convertedCodecAndCompressedUrl.split(".").pop()}` }
    );
    if (!success) {
      setError(
        "Sorry, there was a problem uploading the selected media. Please try again later."
      );
      setLoading(false);

      return;
    }

    const filePath = convertedCodecAndCompressedUrl
      ? Platform.OS == "android"
        ? convertedCodecAndCompressedUrl?.replace("file://", "")
        : convertedCodecAndCompressedUrl
      : Platform.OS == "android"
      ? file?.uri.replace("file://", "")
      : file?.uri;

    const headers = {};
    // Not sure why we use thi instead of the background helper but could be a good reason here.
    await compressorUpload(signedData.signedUrl, filePath, {
      httpMethod: "PUT",
      headers,
    })
      .then(async () => {
        const { success } = await apiCall("POST", "/posts/new", {
          postId: post?._id,
          mediaType: "video",
          mediaKey: signedData.fileKey,
        });
        if (!success) {
          setError(
            "Sorry, we could not upload the selected media. Please try again later."
          );
          setLoading(false);

          return;
        }
        if (Platform.OS === "android") {
          const db = openDatabase("localdb");

          await deleteRunningUploadRecord({
            db,
            postId: post?._id,
          });
          await getRunningUploads(db);
        }
      })
      .catch(async (err) => {
        console.log({ err });
        await apiCall("GET", `/posts/fail/${post?._id}`);
        const db = openDatabase("localdb");

        // delete the record of the job so we don't show a notification of its failure on app launch
        await deleteRunningUploadRecord({ db, postId: post?._id });
        // show notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Failed to upload post`,
            body: `Something went wrong when uploading the media for your post. Please try again later.`,
          },
          trigger: null,
        });
      });
  };

  const setupVideoUploadQueue = async () => {
    const runningJobs = await queue.getJobs();
    const runningWorkers = await queue.registeredWorkers;
    const shouldRefreshWorker =
      (!runningJobs?.length && runningWorkers?.["post_video_upload"]) ||
      !runningWorkers?.["post_video_upload"];

    if (shouldRefreshWorker) {
      queue.removeWorker("post_video_upload", true);
      console.log("KILLING WORKER");
    }

    if (shouldRefreshWorker) {
      queue.addWorker(
        new Worker("post_video_upload", async (payload) => {
          return new Promise((resolve) => {
            setTimeout(async () => {
              await handleVideoCompressionAndUpload({
                post: payload.post,
                file: payload.file,
                thumbnailSignedUrl: payload.thumbnailSignedUrl,
              });

              resolve();
            }, 0);
          });
        })
      );
    }
  };

  const handleFile = async ({
    result,
    type: typeArg,
    fileSelectionMethod = "files",
  }) => {
    if (!result?.assets?.[0]) return;

    const mediaType = result.assets[0].type.split("/")[0];
    const type = typeArg || mediaType;
    setShowMediaSizeError(false);

    // we get media height and width for ios so we set it. We don't get it for android.
    if (Platform.OS === "ios") {
      setHeight(result.assets[0]?.height);
      setWidth(result.assets[0]?.width);
    }

    setLoadingVideo(false);
    if (Platform.OS === "ios") {
      FFmpegKit.cancel();
    }
    setProcessingFile(Platform.OS === "ios" && mediaType === "video");
    setProcessedVideoUri("");
    setGif("");
    setThumbnail("");
    setCompressionProgress(0);
    setSelectedMediaType("");
    const mediaInfo = await getInfoAsync(result.assets[0].uri);
    const mediaSizeInMb = mediaInfo.size / 1000000;
    if (mediaSizeInMb > (isLowendDevice ? 50 : 100)) {
      Alert.alert(
        `Sorry, this ${type} is too large.`,
        `Please choose a file that does not exceed ${
          isLowendDevice ? 50 : 100
        }MB in size.`,
        [
          {
            text: "Cancel",
          },
          {
            text: `Open ${fileSelectionMethod}`,
            onPress: () =>
              fileSelectionMethod === "files"
                ? pickMedia(type)
                : openOSCamera(),
          },
        ]
      );
      setLoading(false);
      return;
    }
    const encoding = await getVideoCodecName(mediaInfo.uri);
    const unsupportedCodec =
      encoding === "hevc" || encoding === "h265" || !encoding;
    if (unsupportedCodec && Platform.OS === "android") {
      Alert.alert(
        "Sorry, this video is unsupported.",
        `Please choose another ${type}.`,
        [
          {
            text: "Cancel",
          },
          {
            text: `Open ${fileSelectionMethod}`,
            onPress: () =>
              fileSelectionMethod === "files"
                ? pickMedia(type)
                : openOSCamera(),
          },
        ]
      );
      return;
    }
    setSelectedMediaType(mediaType);
    setFile({ ...result.assets[0], ...mediaInfo, encoding });
    actionSheetRef.current?.hide();

    if (mediaType === "video") {
      setVideoDuration(result.assets[0].duration);
      if (Platform.OS === "ios") {
        const thumbnailUri = await generateThumbnail(
          result.assets[0].uri,
          result.assets[0].duration
        );
        setThumbnail(thumbnailUri);
        await convertAndEncodeVideo({
          uri: result.assets[0].uri,
          setProgress: setCompressionProgress,
          videoDuration: result.assets[0].duration,
          setProcessedVideoUri,
          setIsRunning: setProcessingFile,
          setError,
        });
      }
    }
  };

  const openOSCamera = async () => {
    let cameraPermission = true;
    let audioPermission = true;
    await Camera.getCameraPermissionStatus().then(async (status) => {
      if (status !== "authorized") {
        await Camera.requestCameraPermission().then(
          (status) => (cameraPermission = status === "authorized")
        );
      }
    });
    await Camera.getMicrophonePermissionStatus().then(async (status) => {
      if (status !== "authorized") {
        await Camera.requestMicrophonePermission().then(
          (status) => (audioPermission = status === "authorized")
        );
      }
    });
    const permissionsRequiredString =
      !cameraPermission && !audioPermission
        ? "camera and microphone"
        : !cameraPermission
        ? "camera"
        : "microphone";
    if (!cameraPermission || !audioPermission) {
      Alert.alert(
        "Cannot access the camera",
        `Please enable ${permissionsRequiredString} permissions to use the camera.`,
        [
          {
            text: "Cancel",
          },
          {
            text: "Enable in App Settings",
            onPress: () => openAppSettings(),
          },
        ]
      );
      return;
    }
    ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.VGA640x480,
      quality: 0.5,
    }).then(async (file) => {
      await handleFile({ result: file, fileSelectionMethod: "camera" });
    });
  };

  const pickMedia = async (type = "image") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Unable to access camera roll",
        "Please enable storage permissions to post media from your local files.",
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
      setLoadingVideo(true);
      const result = await launchImageLibraryAsync({
        quality: 0.3,
        allowsMultipleSelection: false,
        selectionLimit: 1,
        allowsEditing: Platform.OS === "ios" && type === "video",
        mediaTypes:
          type === "image"
            ? ImagePicker.MediaTypeOptions.Images
            : ImagePicker.MediaTypeOptions.Videos,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      });
      if (result.canceled) {
        setLoadingVideo(false);
      }
      if (!result.canceled) {
        await handleFile({ result, type, fileSelectionMethod: "files" });
      }
    }
  };

  const handleGifSelect = ({ gif, gifPreview }) => {
    FFmpegKit.cancel();
    setProcessedVideoUri("");
    setSelectedMediaType("");
    setCompressionProgress(0);
    setShowMediaSizeError(false);
    setFile({});
    setVideoDuration(0);
    setGif(gif);
    setGifPreview(gifPreview);
  };

  useEffect(() => {
    (async () => {
      if (file?.uri && file?.type?.split("/")[0] === "video") {
        if (!isFocused) {
          await videoRef?.current?.pauseAsync(); // fixes audio issues if using music for example
          await videoRef?.current?.unloadAsync(); // remove from memory
        }
        if (isFocused) {
          await videoRef?.current?.loadAsync({ uri: file.uri }); // add back to memory
        }
      }
    })();
  }, [isFocused, file]);

  useEffect(() => {
    (async () => {
      await setupVideoUploadQueue();
    })();
  }, []);

  if (cameraActive && isFocused) {
    return (
      // This is only used on android. Not on IOS
      <CameraStandard
        cameraActive={cameraActive}
        recording={recording}
        setCameraActive={setCameraActive}
        setFile={async (file) => {
          await FFmpegKit.cancel();
          const mediaType = file.type?.split("/")[0];
          setProcessingFile(Platform.OS === "ios" && mediaType === "video");
          setGif("");
          setThumbnail("");
          setCompressionProgress(0);
          setSelectedMediaType("");
          setProcessedVideoUri("");
          const mediaInfo = await getInfoAsync(file.uri);
          const mediaSizeInMb = mediaInfo.size / 1000000;
          if (mediaSizeInMb > (isLowendDevice ? 50 : 100)) {
            setShowMediaSizeError(true);
            setFile({ uri: "none" });
            setLoading(false);
            return;
          }
          setSelectedMediaType(mediaType);
          setFile({ ...file, duration: file?.media?.duration, ...mediaInfo });

          if (mediaType === "video") {
            setVideoDuration((file.media.duration || 0) * 1000);
            if (Platform.OS === "ios") {
              await convertAndEncodeVideo({
                uri: file.uri,
                setProgress: setCompressionProgress,
                videoDuration: (file.media.duration || 0) * 1000,
                setProcessedVideoUri,
                setIsRunning: setProcessingFile,
                setError,
              });
            }
          }
        }}
        setRecording={setRecording}
      />
    );
  }
  return (
    <Fragment>
      <SafeAreaView
        style={{
          flex: 0,
          backgroundColor: themeStyle.colors.grayscale.highest,
        }}
      />
      {Platform.OS === "ios" ? <StatusBar translucent={true} /> : null}
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" && "padding"}
          keyboardVerticalOffset={93}
          style={{ flex: 1 }}
        >
          <GifModal
            selectGif={handleGifSelect}
            active={showGifsModal}
            setShowModal={setShowGifsModal}
          />
          {enableAI && (
            <GPTPromptModal
              setShowModal={setEnableAI}
              active={enableAI}
              postBody={postBody}
              setText={setPostBody}
              setPostImage={setGeneratedImageUrl}
            />
          )}
          <View
            style={{
              padding: 10,
              backgroundColor: themeStyle.colors.grayscale.highest,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomColor: themeStyle.colors.grayscale.higher,
              borderBottomWidth: 2,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                color: themeStyle.colors.primary.default,
              }}
            >
              New Post
            </Text>
            <TouchableOpacity
              disabled={
                (!file.uri && !postBody && !gif && !generatedImageUrl) ||
                loading ||
                showMediaSizeError ||
                loadingVideo ||
                (processingFile && file.uri && !processedVideoUri)
              }
              onPress={() => handlePostCreation()}
            >
              <View
                style={{
                  backgroundColor: themeStyle.colors.primary.default,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 20,
                  width: 75,
                  justifyContent: "center",
                  alignItems: "center",
                  height: 36,
                  opacity:
                    (!file?.uri && !postBody && !gif && !generatedImageUrl) ||
                    showMediaSizeError ||
                    loadingVideo ||
                    (processingFile && file.uri && !processedVideoUri)
                      ? 0.5
                      : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator
                    animating
                    color={themeStyle.colors.white}
                    size={"small"}
                  />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      color: themeStyle.colors.white,
                    }}
                  >
                    Create
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
          {postBody.length >= 2000 - 25 ? (
            <Text style={styles.postLimitMessage}>
              {2000 - postBody.length} Characters Remaining
            </Text>
          ) : null}
          <ScrollView contentContainerStyle={{ padding: 10 }}>
            <TextInput
              style={{
                minHeight: Platform.OS === "web" ? screenHeight / 2 : 100,
                textAlignVertical: "top",
                fontSize: 16,
                color: themeStyle.colors.grayscale.lowest,
                marginBottom: 10,
              }}
              value={postBody}
              placeholder="What's on your mind?"
              placeholderTextColor={themeStyle.colors.grayscale.lower}
              multiline
              maxLength={2000}
              onChangeText={(v) => setPostBody(v)}
            />
            {compressionProgress &&
            selectedMediaType === "video" &&
            !loadingVideo ? (
              <View style={{ width: "95%", alignSelf: "center" }}>
                {processingFile ? (
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.lowest,
                      textAlign: "center",
                      fontWeight: "700",
                    }}
                  >
                    {`Processing - ${Math.min(compressionProgress, 90)}%`}
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.lowest,
                      textAlign: "center",
                      fontWeight: "700",
                    }}
                  >
                    Ready
                  </Text>
                )}
                <View
                  style={{
                    width: `${compressionProgress || 100}%`,
                    height: 5,
                    backgroundColor: themeStyle.colors.secondary.default,
                    borderRadius: 5,
                  }}
                />
              </View>
            ) : null}
            {file.uri || loadingVideo || generatedImageUrl ? (
              <View
                style={{
                  borderWidth: showMediaSizeError ? 2 : 0,
                  borderColor: themeStyle.colors.error.default,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  borderRadius: 10,
                }}
              >
                <TouchableOpacity
                  style={{
                    alignSelf: "flex-end",
                    height: 48,
                    width: 48,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={async () => {
                    await videoRef?.current?.pauseAsync(); // fixes audio issues if using music for example
                    await videoRef?.current?.unloadAsync(); // remove from memory
                    FFmpegKit.cancel();
                    setFile({}); // make sure video is no longer in state
                    setVideoDuration(0);
                    setShowMediaSizeError(false);
                    setSelectedMediaType("");
                  }}
                >
                  <AntDesign
                    name="close"
                    size={30}
                    color={themeStyle.colors.grayscale.lowest}
                    style={{}}
                  />
                </TouchableOpacity>

                {showMediaSizeError ? (
                  <Text
                    style={{
                      color: themeStyle.colors.error.default,
                      marginHorizontal: 5,
                    }}
                  >
                    Choose a file smaller than{" "}
                    {isLowendDevice ? "50MB" : "100MB"}
                  </Text>
                ) : selectedMediaType === "video" || loadingVideo ? (
                  <View
                    style={{
                      alignItems: "center",
                      padding: 5,
                      justifyContent: "center",
                    }}
                  >
                    {loadingVideo ? (
                      <View
                        style={{
                          height: 300,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ActivityIndicator
                          animating={loadingVideo}
                          style={{ position: "absolute", zIndex: 99 }}
                          color={themeStyle.colors.secondary.default}
                          size="large"
                        />
                      </View>
                    ) : (
                      <>
                        <ImageWithCache
                          onLoad={(e) => {
                            if (!height || !width) {
                              setHeight(e?.nativeEvent?.source?.height);
                              setWidth(e?.nativeEvent?.source?.width);
                            }
                          }}
                          style={{ height: 1, width: 1, opacity: 0 }} // so onload gets called we set height and width to 1. Doesn't when set to 0
                          // For ios, we generate thumbnail following video selection. We don't do this for android so we fallback to file.uri
                          mediaUrl={thumbnail || file.uri}
                        />

                        <VideoPlayer
                          autoHidePlayer={false}
                          fullscreen
                          mediaIsSelfie
                          videoProps={{
                            shouldPlay: false,
                            resizeMode: "contain",
                            source: {
                              uri: file.uri,
                            },
                            ref: videoRef,
                            style: {
                              transform: [{ scaleX: file.isSelfie ? -1 : 1 }],
                              height: "100%",
                            },
                          }}
                          style={{ height: 300 }}
                        />
                      </>
                    )}
                  </View>
                ) : selectedMediaType || generatedImageUrl ? (
                  <View
                    style={{
                      height: screenWidth - 40,
                      alignItems: "center",
                      padding: 5,
                    }}
                  >
                    <ImageWithCache
                      onLoad={(e) => {
                        setHeight(e?.nativeEvent?.source?.height);
                        setWidth(e?.nativeEvent?.source?.width);
                      }}
                      removeBackround
                      mediaIsSelfie={!!file?.isSelfie}
                      resizeMode="contain"
                      mediaUrl={file?.uri || generatedImageUrl}
                      aspectRatio={1 / 1}
                      removeBorderRadius
                    />
                  </View>
                ) : null}
              </View>
            ) : gif ? (
              <View
                style={{
                  backgroundColor: "rgba(0,0,0,0.4)",
                  borderRadius: 10,
                  maxWidth: 900,
                  alignSelf: "center",
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  style={{
                    alignSelf: "flex-end",
                    height: 48,
                    width: 48,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => {
                    setFile({});
                    setVideoDuration(0);
                    setShowMediaSizeError(false);
                    setGif("");
                    setSelectedMediaType("");
                  }}
                >
                  <AntDesign
                    name="close"
                    size={30}
                    color={themeStyle.colors.grayscale.lowest}
                    style={{}}
                  />
                </TouchableOpacity>
                <View
                  style={{
                    maxHeight: 340,
                    alignItems: "center",
                    padding: 5,
                    height: screenWidth - 40,
                  }}
                >
                  <Video
                    shouldPlay
                    isLooping
                    resizeMode="contain"
                    style={{ width: "100%", height: "100%", maxHeight: 300 }}
                    source={{ uri: gif }}
                    isMuted
                  />
                </View>
              </View>
            ) : null}
          </ScrollView>
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                {Platform.OS !== "web" && !showGifsModal ? (
                  <ActionSheet
                    ref={actionSheetRef}
                    gestureEnabled={true}
                    containerStyle={{
                      backgroundColor: themeStyle.colors.grayscale.higher,
                    }}
                  >
                    <View style={{ marginVertical: 20, paddingHorizontal: 10 }}>
                      {/* <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginHorizontal: 10,
                          marginBottom: 30,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => setEnableAI(true)}
                          style={{ alignItems: "center", flexDirection: "row" }}
                        >
                          <View
                            style={{
                              backgroundColor:
                                themeStyle.colors.grayscale
                                  .transparentHighest50,
                              height: 48,
                              width: 48,
                              borderRadius: 26,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <MaterialCommunityIcons
                              name="robot-happy-outline"
                              size={24}
                              color={themeStyle.colors.grayscale.lowest}
                            />
                            <Text
                              style={{
                                color: themeStyle.colors.grayscale.lowest,
                                fontSize: 10,
                              }}
                            >
                              Image
                            </Text>
                          </View>
                          <Text
                            style={{
                              color: themeStyle.colors.grayscale.lowest,
                              fontWeight: "700",
                              marginLeft: 10,
                            }}
                          >
                            Add AI Generated Image
                          </Text>
                        </TouchableOpacity>
                      </View> */}
                      {!showImageOrVideoOption && (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginHorizontal: 10,
                            marginBottom: 30,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              setEnableAI(true);
                              actionSheetRef.current?.hide();
                            }}
                            style={{
                              alignItems: "center",
                              flexDirection: "row",
                            }}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  themeStyle.colors.grayscale
                                    .transparentHighest50,
                                height: 48,
                                width: 48,
                                borderRadius: 26,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <MaterialCommunityIcons
                                name="robot-happy-outline"
                                size={24}
                                color={themeStyle.colors.grayscale.lowest}
                              />
                              <Text
                                style={{
                                  color: themeStyle.colors.grayscale.lowest,
                                  fontSize: 10,
                                }}
                              >
                                Text
                              </Text>
                            </View>
                            <Text
                              style={{
                                color: themeStyle.colors.grayscale.lowest,
                                fontWeight: "700",
                                marginLeft: 10,
                              }}
                            >
                              Add AI Generated Post Body
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginHorizontal: 10,
                          marginBottom: 30,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => pickMedia("image")}
                          style={{ alignItems: "center", flexDirection: "row" }}
                        >
                          <View
                            style={{
                              backgroundColor:
                                themeStyle.colors.grayscale
                                  .transparentHighest50,
                              height: 48,
                              width: 48,
                              borderRadius: 26,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <FontAwesome
                              name="image"
                              size={24}
                              color={themeStyle.colors.grayscale.lowest}
                            />
                          </View>
                          <Text
                            style={{
                              color: themeStyle.colors.grayscale.lowest,
                              fontWeight: "700",
                              marginLeft: 10,
                            }}
                          >
                            Add Image
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginHorizontal: 10,
                          marginBottom: 30,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => pickMedia("video")}
                          style={{ alignItems: "center", flexDirection: "row" }}
                        >
                          <View
                            style={{
                              backgroundColor:
                                themeStyle.colors.grayscale
                                  .transparentHighest50,
                              height: 48,
                              width: 48,
                              borderRadius: 26,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                borderColor:
                                  themeStyle.colors.grayscale.highest,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <MaterialCommunityIcons
                                name="movie-open-play-outline"
                                size={26}
                                color={themeStyle.colors.grayscale.lowest}
                              />
                            </View>
                          </View>
                          <Text
                            style={{
                              color: themeStyle.colors.grayscale.lowest,
                              fontWeight: "700",
                              marginLeft: 10,
                            }}
                          >
                            Add Video
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {!showImageOrVideoOption ? (
                        <>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginHorizontal: 10,
                              marginBottom: 30,
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => setShowGifsModal(true)}
                              style={{
                                alignItems: "center",
                                flexDirection: "row",
                              }}
                            >
                              <View
                                style={{
                                  backgroundColor:
                                    themeStyle.colors.grayscale
                                      .transparentHighest50,
                                  height: 48,
                                  width: 48,
                                  borderRadius: 26,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <View
                                  style={{
                                    borderColor:
                                      themeStyle.colors.grayscale.lowest,
                                    borderWidth: 2,
                                    height: 27,
                                    width: 27,
                                    borderRadius: 5,
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <MaterialIcons
                                    name="gif"
                                    size={24}
                                    color={themeStyle.colors.grayscale.lowest}
                                  />
                                </View>
                              </View>
                              <Text
                                style={{
                                  color: themeStyle.colors.grayscale.lowest,
                                  fontWeight: "700",
                                  marginLeft: 10,
                                }}
                              >
                                Add Gif
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginHorizontal: 10,
                              marginBottom: 30,
                            }}
                          >
                            <TouchableOpacity
                              onPress={async () => {
                                if (Platform.OS === "ios") {
                                  await openOSCamera();
                                } else {
                                  setCameraActive(true);
                                }
                              }}
                              style={{
                                alignItems: "center",
                                flexDirection: "row",
                              }}
                            >
                              <View
                                style={{
                                  backgroundColor:
                                    themeStyle.colors.grayscale
                                      .transparentHighest50,
                                  height: 48,
                                  width: 48,
                                  borderRadius: 26,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Feather
                                  name="camera"
                                  size={26}
                                  color={themeStyle.colors.grayscale.lowest}
                                />
                              </View>
                              <Text
                                style={{
                                  color: themeStyle.colors.grayscale.lowest,
                                  fontWeight: "700",
                                  marginLeft: 10,
                                }}
                              >
                                Use Camera
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      ) : null}
                    </View>
                  </ActionSheet>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginHorizontal: 10,
                      borderWidth: 1,
                      borderColor: themeStyle.colors.grayscale.lowest,
                      borderRadius: 5,
                    }}
                  >
                    <TouchableOpacity onPress={() => setShowGifsModal(true)}>
                      <MaterialIcons
                        name="gif"
                        size={24}
                        color={themeStyle.colors.grayscale.lowest}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={async () => {
                  if (Platform.OS === "ios") {
                    await openOSCamera();
                  } else {
                    setCameraActive(true);
                  }
                }}
                style={{
                  height: 48,
                  width: 48,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    borderColor: themeStyle.colors.grayscale.lowest,
                    borderWidth: 2,
                    height: 40,
                    width: 40,
                    borderRadius: 5,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FontAwesome
                    name="camera"
                    size={16}
                    color={themeStyle.colors.grayscale.lowest}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowImageOrVideoOption(true);
                  actionSheetRef.current?.show();
                }}
                style={{
                  height: 48,
                  width: 48,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    borderColor: themeStyle.colors.grayscale.lowest,
                    borderWidth: 2,
                    height: 40,
                    width: 40,
                    borderRadius: 5,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FontAwesome5
                    name="photo-video"
                    size={16}
                    color={themeStyle.colors.grayscale.lowest}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowGifsModal(true)}
                style={{
                  height: 48,
                  width: 48,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    borderColor: themeStyle.colors.grayscale.lowest,
                    borderWidth: 2,
                    height: 40,
                    width: 40,
                    borderRadius: 5,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons
                    name="gif"
                    size={26}
                    color={themeStyle.colors.grayscale.lowest}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEnableAI(!enableAI)}
                style={{
                  height: 48,
                  width: 48,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <LinearGradient
                  start={[0, 0.5]}
                  end={[0, 1]}
                  style={[
                    {
                      width: 40,
                      height: 40,
                      alignSelf: "center",
                      padding: 2,
                      borderRadius: 5,
                    },
                  ]}
                  colors={["#138294", "#66b5ff"]}
                >
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: themeStyle.colors.grayscale.highest,
                      borderRadius: 3,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="robot-happy-outline"
                      size={24}
                      color={themeStyle.colors.grayscale.lowest}
                    />
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.lowest,
                        fontSize: 10,
                      }}
                    >
                      AI
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowImageOrVideoOption(false);
                  actionSheetRef.current?.show();
                }}
                style={{
                  height: 48,
                  width: 48,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    borderColor: themeStyle.colors.grayscale.lowest,
                    borderWidth: 2,
                    height: 40,
                    width: 40,
                    borderRadius: 5,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Entypo
                    name="dots-three-horizontal"
                    size={24}
                    color={themeStyle.colors.grayscale.lowest}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          {error ? (
            <View>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Fragment>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postLimitMessage: {
    alignSelf: "flex-end",
    color: themeStyle.colors.error.default,
  },
  errorMessage: {
    textAlign: "center",
    color: themeStyle.colors.error.default,
    fontSize: 14,
  },
});

export default gestureHandlerRootHOC(AddScreen);
