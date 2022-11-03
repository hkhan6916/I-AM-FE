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
  Image,
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
  Video as VideoCompress,
  Image as ImageCompress,
  backgroundUpload as compressorUpload,
} from "react-native-compressor";
import VideoPlayer from "expo-video-player";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { getThumbnailAsync } from "expo-video-thumbnails";
import { StatusBar } from "expo-status-bar";
import GifModal from "../../../components/GifModal";
import openAppSettings from "../../../helpers/openAppSettings";
import backgroundUpload from "../../../helpers/backgroundUpload";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import convertAndEncodeVideo from "../../../helpers/convertAndEncodeVideo";
import { useSelector } from "react-redux";
import getVideoCodecName from "../../../helpers/getVideoCodecName";
import { FFmpegKit } from "ffmpeg-kit-react-native";

const AddScreen = () => {
  const isFocused = useIsFocused();
  const [postBody, setPostBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showMediaSizeError, setShowMediaSizeError] = useState(false);
  const [showGifsModal, setShowGifsModal] = useState(false);
  const [gif, setGif] = useState("");
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [thumbnail, setThumbnail] = useState("");
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [processedVideoUri, setProcessedVideoUri] = useState("");
  const [processingFile, setProcessingFile] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState(false);
  const navigation = useNavigation();

  const videoRef = useRef(null);

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const dispatch = useDispatch();

  const isLowendDevice = useSelector((state) => state.isLowendDevice)?.state;

  const createPostData = async () => {
    let postData = {};
    if (postBody) {
      // upload any text body if there is an
      postData.postBody = postBody;
    }
    if (gif) {
      // if there's a gif, skip everything and just upload the gif
      postData.gif = gif;
      return postData;
    }
    if (file.uri) {
      // if there's a file, determine if compression is required
      const { type, uri, isSelfie } = file;
      if (type.split("/")[0] === "video") {
        ///here, need to upload figure out how to upload thumbnails

        // just adds thumbnail for videos. We add the rest of the media later.
        const thumbnailUri = await generateThumbnail(uri);
        const thumbnailFormat = thumbnailUri.split(".").pop();

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
          return;
        }
        postData.mimetype = thumbnailFormat;
        postData.mediaKey = response.fileKey; // This is the thumbnail. We send this to backend which saves it as the thumbnailkey for this post,
        postData.mediaType = "video";
        postData.mediaIsSelfie = isSelfie || false;
        postData.height = height;
        postData.width = width;

        await backgroundUpload({
          // TODO: try axios here
          filePath: thumbnailUri,
          url: response.signedUrl,
        });
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
            console.log({ compression: progress });
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

  const generateThumbnail = async (path) => {
    try {
      const { uri } = await getThumbnailAsync(path || file.uri, {
        time: 0,
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
      if (file.type?.split("/")[0] === "video") {
        dispatch({
          type: "SET_POST_CREATED",
          payload: { posted: true, type: "created" },
        });
        await handleVideoCompressionAndUpload(response.post);
        if (Platform.OS === "android") {
          navigation.navigate("Home");
        }
      } else {
        dispatch({
          type: "SET_POST_CREATED",
          payload: { posted: true, type: "created" },
        });
        navigation.navigate("Home");
      }
    } else {
      setLoading(false);
      setError(
        "An error occurred creating your post. Please try again, or check your connection."
      );
    }
  };

  const handleVideoCompressionAndUpload = async (post) => {
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
        "Sorry, we could not upload the selected media. Please try again later."
      );
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
    }).then(async () => {
      const { success } = await apiCall("POST", "/posts/new", {
        postId: post?._id,
        mediaType: "video",
        mediaKey: signedData.fileKey,
      });
      if (!success) {
        setError(
          "Sorry, we could not upload the selected media. Please try again later."
        );
      }
    });
  };

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Unable access camera roll",
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
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.3,
        allowsMultipleSelection: false,
        selectionLimit: 1,
      });
      if (!result.cancelled) {
        FFmpegKit.cancel();
        setGif("");
        setThumbnail("");
        setCompressionProgress(0);
        setProcessingFile(false);
        setSelectedMediaType("");
        const mediaInfo = await getInfoAsync(result.uri);
        const mediaSizeInMb = mediaInfo.size / 1000000;

        if (mediaSizeInMb > (isLowendDevice ? 50 : 100)) {
          setShowMediaSizeError(true);
          setFile({ uri: "none" });
          setLoading(false);
          return;
        }
        const encoding = await getVideoCodecName(result.uri);
        if (
          encoding &&
          (encoding === "hevc" || encoding === "h265") &&
          Platform.OS === "android"
        ) {
          Alert.alert(
            "Sorry, this video is unsupported.",
            "Please choose another video or image.",
            [
              {
                text: "Cancel",
              },
              {
                text: "Open files",
                onPress: () => pickMedia(),
              },
            ]
          );
          return;
        }
        const mediaType = result.type.split("/")[0];
        setSelectedMediaType(mediaType);
        setFile({ ...result, ...mediaInfo });
        if (mediaType === "video") {
          const thumbnailUri = await generateThumbnail(result.uri);
          setThumbnail(thumbnailUri);
          setVideoDuration(result.duration);
          if (Platform.OS === "ios") {
            setProcessingFile(true);
            const convertedCodecAndCompressedUrl = await convertAndEncodeVideo({
              uri: result.uri,
              setProgress: setCompressionProgress,
              videoDuration: result.duration,
            });
            setProcessedVideoUri(convertedCodecAndCompressedUrl);
            setProcessingFile(false);
          }
        }

        setShowMediaSizeError(false);
      }
    }
  };

  const handleGifSelect = (gifUrl) => {
    FFmpegKit.cancel();
    setSelectedMediaType("");
    setCompressionProgress(0);
    setShowMediaSizeError(false);
    setFile({});
    setVideoDuration(0);
    setGif(gifUrl);
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

  if (cameraActive && isFocused) {
    return (
      <CameraStandard
        cameraActive={cameraActive}
        recording={recording}
        setCameraActive={setCameraActive}
        setFile={async (file) => {
          setThumbnail("");
          if (file.type?.split("/")[0] === "video") {
            const { uri } = await getThumbnailAsync(file.uri, {
              time: 0,
              quality: 0.5,
            });
            setThumbnail(uri);
          }
          setFile(file);
          setGif("");
          setLoading(false);
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
            <View
              style={{
                justifyContent: "center",
                flexDirection: "row",
                opacity:
                  (!file?.uri && !postBody && !gif) ||
                  showMediaSizeError ||
                  processingFile
                    ? 0.7
                    : 1,
                marginHorizontal: 10,
              }}
            >
              <TouchableOpacity
                disabled={
                  (!file.uri && !postBody && !gif) ||
                  loading ||
                  showMediaSizeError ||
                  processingFile
                }
                onPress={() => handlePostCreation()}
              >
                {loading ? (
                  <ActivityIndicator
                    animating
                    color={themeStyle.colors.secondary.default}
                    size={"small"}
                  />
                ) : (
                  <Text
                    style={{
                      fontSize: 18,
                      color: themeStyle.colors.secondary.default,
                    }}
                  >
                    Create
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
              }}
              value={postBody}
              placeholder="What's on your mind?"
              placeholderTextColor={themeStyle.colors.grayscale.lower}
              multiline
              maxLength={2000}
              onChangeText={(v) => setPostBody(v)}
            />
            {compressionProgress && selectedMediaType === "video" ? (
              <View>
                <Text
                  style={{
                    color: themeStyle.colors.grayscale.lowest,
                    textAlign: "center",
                    marginBottom: 5,
                  }}
                >
                  Processing - {compressionProgress}%
                </Text>
                <View
                  style={{
                    width: `${compressionProgress || 0}%`,
                    height: 5,
                    backgroundColor: themeStyle.colors.secondary.default,
                    borderRadius: 20,
                  }}
                />
              </View>
            ) : null}
            {file.uri ? (
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
                ) : thumbnail ? (
                  <View
                    style={{
                      alignItems: "center",
                      padding: 5,
                    }}
                  >
                    <ImageWithCache
                      onLoad={(e) => {
                        setHeight(e?.nativeEvent?.source?.height);
                        setWidth(e?.nativeEvent?.source?.width);
                      }}
                      style={{ height: 1, width: 1, opacity: 0 }} // so onload gets called we set height and width to 1. Doesn't when set to 0
                      mediaUrl={thumbnail}
                    />

                    <VideoPlayer
                      autoHidePlayer={false}
                      fullscreen
                      mediaIsSelfie
                      videoProps={{
                        shouldPlay: true,
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
                  </View>
                ) : selectedMediaType ? (
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
                      mediaIsSelfie={file.isSelfie}
                      resizeMode="contain"
                      mediaUrl={file.uri}
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
                  <Image
                    resizeMode="contain"
                    style={{ width: "100%", height: "100%", maxHeight: 300 }}
                    source={{ uri: gif }}
                  />
                </View>
              </View>
            ) : null}
          </ScrollView>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 10,
              backgroundColor: themeStyle.colors.grayscale.highest,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              {Platform.OS !== "web" ? (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginHorizontal: 10,
                    }}
                  >
                    <TouchableOpacity onPress={() => setCameraActive(true)}>
                      <FontAwesome
                        name="camera"
                        size={24}
                        color={themeStyle.colors.grayscale.lowest}
                      />
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginHorizontal: 10,
                    }}
                  >
                    <TouchableOpacity onPress={() => pickMedia()}>
                      <FontAwesome
                        name="image"
                        size={24}
                        color={themeStyle.colors.grayscale.lowest}
                      />
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}
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
