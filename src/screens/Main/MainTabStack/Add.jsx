import React, { Fragment, useState } from "react";
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
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
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
import { Image } from "react-native";

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

  const navigation = useNavigation();

  const { width: screenWidth } = Dimensions.get("window");

  const userData = useSelector((state) => state.userData);

  const dispatch = useDispatch();
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
      const { type, name, uri, isSelfie } = file;
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
          filePath:
            Platform.OS == "android"
              ? thumbnailUri.replace("file://", "")
              : thumbnailUri,
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
        if (mediaSizeInMb >= 100) {
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
          filePath: Platform.OS == "android" ? uri.replace("file://", "") : uri,
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
    setLoading(true);
    const postData = await createPostData();

    if (!postData) return null;
    const { success, response, message } = await apiCall(
      "POST",
      "/posts/new",
      postData
    );
    setLoading(false);
    if (success) {
      setThumbnail("");
      setGif("");
      return response.post;
    } else {
      setLoading(false);
      setError(
        "An error occurred creating your post. Please try again, or check your connection."
      );
      return;
    }
  };

  const handleVideoUpload = async (compressedUrl, post) => {
    const { response: signedData, success } = await apiCall(
      "POST",
      "/files/signed-upload-url",
      { filename: `media.${compressedUrl.split(".").pop()}` }
    );
    if (!success) {
      setError(
        "Sorry, we could not upload the selected media. Please try again later."
      );
      return;
    }
    const filePath = compressedUrl
      ? Platform.OS == "android"
        ? compressedUrl?.replace("file://", "/")
        : compressedUrl
      : Platform.OS == "android"
      ? file?.uri.replace("file://", "")
      : file?.uri;

    // await uploadAsync(signedData.signedUrl, filePath, {
    //   httpMethod: "PUT",
    //   fieldName: "file",
    //   // Below are options only supported on Android
    // })
    //   .then(async () => {
    //     const { response, success } = await apiCall("POST", "/posts/new", {
    //       postId: post?._id,
    //       mediaType: "video",
    //       mediaKey: signedData.fileKey,
    //     });
    //     if (!success) {
    //       setError(
    //         "Sorry, we could not upload the selected media. Please try again later."
    //       );
    //     }
    //   })
    //   .catch((err) => console.error(err));

    const headers = {};

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

    // await backgroundUpload({
    //   filePath,
    //   url: signedData.signedUrl,
    //   failureRoute: `/posts/fail/${post?._id}`,
    //   onComplete: async () => {
    //     const { response, success } = await apiCall("POST", "/posts/new", {
    //       postId: post?._id,
    //       mediaType: "video",
    //       mediaKey: signedData.fileKey,
    //     });
    //     if (!success) {
    //       setError(
    //         "Sorry, we could not upload the selected media. Please try again later."
    //       );
    //     }
    //   },
    // });
  };

  const handleLargeFileCompression = async (post) => {
    await VideoCompress.compress(
      file.uri,
      {
        compressionMethod: "auto",
        minimumFileSizeForCompress: 10,
      },
      (progress) => {
        console.log({ compression: progress });
      }
    )
      .then(async (compressedUrl) => {
        await handleVideoUpload(compressedUrl, post);
      })
      .catch(async (e) => {
        // await apiCall("GET", `/posts/fail/${post?._id}`);

        console.log(e);
      }); // TODO:maybe show notification here?
  };

  const createPost = async () => {
    setError("");
    await handlePostCreation().then(async (post) => {
      if (!post) return;
      setPostBody("");
      setFile("");
      if (file.type?.split("/")[0] === "video") {
        dispatch({
          type: "SET_POST_CREATED",
          payload: { posted: true, type: "created" },
        });
        navigation.navigate("Home");
        await handleLargeFileCompression(post);
      } else {
        dispatch({
          type: "SET_POST_CREATED",
          payload: { posted: true, type: "created" },
        });
        navigation.navigate("Home");
      }
    });
  };

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Unable access camera roll",
        "Please enable storage permissions to post media files.",
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
      setGif("");
      setThumbnail("");
      if (!result.cancelled) {
        const mediaInfo = await getInfoAsync(result.uri);
        const mediaSizeInMb = mediaInfo.size / 1000000;
        if (mediaSizeInMb > 100) {
          setShowMediaSizeError(true);
          setFile({ ...result, ...mediaInfo });
          setLoading(false);
          return;
        }
        if (result.type.split("/")[0] === "video") {
          const thumbnailUri = await generateThumbnail(result.uri);
          setThumbnail(thumbnailUri);
        }
        setShowMediaSizeError(false);
        setFile({ ...result, ...mediaInfo });
      }
    }
  };

  const handleGifSelect = (gifUrl) => {
    setFile({});
    setGif(gifUrl);
  };

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
                opacity: !file?.uri && !postBody && !gif ? 0.7 : 1,
                marginHorizontal: 10,
              }}
            >
              <TouchableOpacity
                disabled={
                  (!file.uri && !postBody && !gif) ||
                  loading ||
                  showMediaSizeError
                }
                onPress={() => createPost()}
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
                minHeight: 100,
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
            {file.uri ? (
              <View
                style={{
                  borderWidth: !showMediaSizeError ? 1 : 2,
                  borderRadius: 5,
                  backgroundColor: themeStyle.colors.grayscale.high,
                  borderColor: !showMediaSizeError
                    ? themeStyle.colors.primary.default
                    : themeStyle.colors.error.default,
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
                  }}
                >
                  <AntDesign
                    name="close"
                    size={24}
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
                    Choose a file smaller than 100MB
                  </Text>
                ) : null}
                {thumbnail ? (
                  <View
                    style={{
                      height: screenWidth,
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
                        style: {
                          transform: [{ scaleX: file.isSelfie ? -1 : 1 }],
                          height: "100%",
                        },
                      }}
                      style={{ height: 300 }}
                    />
                  </View>
                ) : file.type?.split("/")[0] === "image" ? (
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
                  height: screenWidth - 40,
                  alignItems: "center",
                  padding: 5,
                }}
              >
                <Image
                  resizeMode="cover"
                  style={{ width: "100%", height: "100%" }}
                  source={{ uri: gif }}
                />
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
