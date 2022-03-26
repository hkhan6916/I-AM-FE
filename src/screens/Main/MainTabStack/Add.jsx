import React, { Fragment, useEffect, useState } from "react";
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
  Image,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { Video } from "expo-av";
import themeStyle from "../../../theme.style";
import apiCall from "../../../helpers/apiCall";
import CameraStandard from "../../../components/CameraStandard";
import ImageWithCache from "../../../components/ImageWithCache";
import * as ImagePicker from "expo-image-picker";
import { getInfoAsync } from "expo-file-system";
import {
  Video as VideoCompress,
  Image as ImageCompress,
} from "react-native-compressor";
import VideoPlayer from "expo-video-player";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { getThumbnailAsync } from "expo-video-thumbnails";
import Upload from "react-native-background-upload";
import { getItemAsync } from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GifModal from "../../../components/GifModal";

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

  const navigation = useNavigation();

  const { width: screenWidth } = Dimensions.get("window");

  const dispatch = useDispatch();
  const createPostData = async () => {
    const postData = new FormData();
    if (postBody) {
      // upload any text body if there is any
      postData.append("postBody", postBody);
    }
    if (gif) {
      // if there's a gif, skip everything and just upload the gif
      postData.append("gif", gif);
      return postData;
    }
    if (file.uri) {
      // if there's a file, determine if compression is required
      const { type, name, uri, isSelfie } = file;
      if (type.split("/")[0] === "video") {
        // just adds thumbnail for videos. We add the rest of the media later.
        const thumbnailUri = await generateThumbnail(uri);
        const thumbnailFormat = thumbnailUri.split(".").pop();
        postData.append("file", {
          type: `image/${thumbnailFormat}`,
          name: `mediaThumbnail.${thumbnailFormat}`,
          uri: thumbnailUri,
        });
      } else {
        const mediaInfo = await getInfoAsync(uri);
        const mediaSizeInMb = mediaInfo?.size / 1000000;
        if (mediaSizeInMb >= 14) {
          // if image size is more than or equal to 14mb then compress it
          const format = uri.split(".").pop();
          const compressedUri = await ImageCompress.compress(
            uri,
            {
              compressionMethod: "auto",
            },
            (progress) => {
              console.log({ compression: progress });
            }
          );
          postData.append("file", {
            type: type.split("/").length > 1 ? type : `${type}/${format}`,
            name: name || `media.${format}`,
            compressedUri,
          });
          postData.append("mediaIsSelfie", isSelfie || false);
        } else {
          // otherwise we just send the image without compression
          const format = uri.split(".").pop();
          postData.append("file", {
            type: type.split("/").length > 1 ? type : `${type}/${format}`,
            name: name || `media.${format}`,
            uri,
          });
          postData.append("mediaIsSelfie", isSelfie || false);
        }
      }
    }

    return postData;
  };

  const generateThumbnail = async () => {
    try {
      const { uri } = await getThumbnailAsync(file.uri, {
        time: 0,
      });
      return uri;
    } catch (e) {
      console.warn(e);
    }
  };

  const handlePostCreation = async () => {
    setLoading(true);
    const postData = await createPostData();
    const { success, response } = await apiCall("POST", "/posts/new", postData);
    setLoading(false);
    if (success) {
      setGif("");
      return response.post;
    } else {
      setError(
        "An error occurred creating your post. Please try again, or check your connection."
      );
      return;
    }
  };

  const handleBackgroundUpload = async (compressedUrl, post) => {
    const token = await getItemAsync("authToken");
    const url = compressedUrl
      ? Platform.OS == "android"
        ? compressedUrl?.replace("file://", "/")
        : compressedUrl
      : Platform.OS == "android"
      ? file?.uri.replace("file://", "")
      : file?.uri;
    const options = {
      url: "http://192.168.5.101:5000/posts/new",
      path: url,
      method: "POST",
      type: "multipart",
      maxRetries: 2, // set retry count (Android only). Default 2
      headers: {
        "content-type": "multipart/form-data", // Customize content-type
        Authorization: `Bearer ${token}`,
      },
      parameters: {
        postId: post?._id,
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
        console.log("Upload started");
        Upload.addListener("progress", uploadId, (data) => {
          console.log(`Progress: ${data.progress}%`);
          console.log(data);
        });
        Upload.addListener("error", uploadId, async (data) => {
          console.log({ data });
          console.log(`Error: ${data.error}%`);
          await apiCall("GET", "/posts/fail/" + post?._id);
        });
        Upload.addListener("cancelled", uploadId, async (data) => {
          console.log(`Cancelled!`);
          await apiCall("GET", "/posts/fail/" + post?._id);
        });
        Upload.addListener("completed", uploadId, (data) => {
          console.log(data);
          console.log("Completed!");
        });
      })
      .catch((err) => {
        console.log("Upload error!", err);
      });
  };

  const handleLargeFileUpload = async (post) => {
    if (file.type?.split("/")[0] === "video") {
      dispatch({
        type: "SET_POST_CREATED",
        payload: { posted: true, type: "created" },
      });
      navigation.navigate("Home");
      await VideoCompress.compress(
        file.uri,
        {
          compressionMethod: "auto",
        },
        (progress) => {
          console.log({ compression: progress });
        }
      ).then(async (compressedUrl) => {
        await handleBackgroundUpload(compressedUrl, post);
      });
    }
  };

  const createPost = async () => {
    setError("");
    await handlePostCreation().then(async (post) => {
      if (!post) return;
      setPostBody("");
      setFile("");
      if (file.type?.split("/")[0] === "video") {
        await handleLargeFileUpload(post);
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
      alert("Sorry, we need camera roll permissions to make this work.");
    }

    if (status === "granted") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.3,
        allowsMultipleSelection: false,
      });
      setGif("");
      if (!result.cancelled) {
        const mediaInfo = await getInfoAsync(result.uri);
        const mediaSizeInMb = mediaInfo.size / 1000000;
        if (mediaSizeInMb > 100) {
          setShowMediaSizeError(true);
          setFile({ ...result, ...mediaInfo });
          return;
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
        setFile={setFile}
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
                disabled={!file.uri && !postBody && !gif}
                onPress={() => createPost()}
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
                  borderColor: !showMediaSizeError
                    ? themeStyle.colors.primary.default
                    : themeStyle.colors.error.default,
                }}
              >
                <TouchableOpacity
                  style={{ alignSelf: "flex-end" }}
                  onPress={() => {
                    setFile({});
                  }}
                >
                  <AntDesign
                    name="close"
                    size={24}
                    color={themeStyle.colors.grayscale.lowest}
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
                {file.type?.split("/")[0] === "video" ? (
                  <View
                    style={{
                      height: screenWidth,
                      alignItems: "center",
                      padding: 5,
                    }}
                  >
                    <VideoPlayer // TODO create new player as need to flip the media for selfie video without flipping the controls.
                      autoHidePlayer={false}
                      fullscreen
                      mediaIsSelfie
                      videoProps={{
                        shouldPlay: true,
                        resizeMode: Video.RESIZE_MODE_CONTAIN,
                        source: {
                          uri: file.uri,
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
                  resizeMode="contain"
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
                  <MaterialCommunityIcons
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

export default AddScreen;
