import React, { Fragment, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Keyboard,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  TouchableOpacity,
  NativeModules,
  Platform,
  Dimensions,
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
// import ExpoVideoPlayer from "../../../components/ExpoVideoPlayer";
// import VideoPlayer from "../../../components/VideoPlayer";
import VideoPlayer from "expo-video-player";
import { LinearGradient } from "expo-linear-gradient";
import { backgroundUpload } from "react-native-compressor";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import Upload from "react-native-background-upload";
import { getItemAsync } from "expo-secure-store";
import { manipulateAsync } from "expo-image-manipulator";
import { StatusBar } from "expo-status-bar";
import * as ScreenOrientation from "expo-screen-orientation";

const AddScreen = (props) => {
  const isFocused = useIsFocused();
  const [postBody, setPostBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState({});
  const [compressedFileUrl, setCompressedFileUrl] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [showMediaSizeError, setShowMediaSizeError] = useState(false);
  const [removeMedia, setRemoveMedia] = useState(false);
  const navigation = useNavigation();

  const existingPost = props.route.params?.post;

  const { width: screenWidth } = Dimensions.get("window");

  const dispatch = useDispatch();
  const createPostData = async () => {
    const postData = new FormData();
    if (file.uri) {
      const { type, name, uri, orientation, isSelfie } = file;
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
        const format = uri.split(".").pop();
        postData.append("file", {
          type: type.split("/").length > 1 ? type : `${type}/${format}`,
          name: name || `media.${format}`,
          uri,
        });
        postData.append("mediaOrientation", orientation || "");
        postData.append("mediaIsSelfie", isSelfie || false);
      }
    }
    if (existingPost) {
      // if existing post, append remove media incase user wants to rmeove old media file
      postData.append("removeMedia", removeMedia);
    }
    if (postBody) {
      postData.append("postBody", postBody);
    }

    return postData;
  };

  const generateThumbnail = async () => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(file.uri, {
        time: 0,
      });
      return uri;
    } catch (e) {
      console.warn(e);
    }
  };

  const handlePostCreation = async () => {
    const postData = await createPostData();
    const { success, response } = !existingPost
      ? await apiCall("POST", "/posts/new", postData)
      : await apiCall("POST", `/posts/update/${existingPost?._id}`, postData);
    if (success) {
      return existingPost || response.post;
    } else {
      setError({
        title: "Well... that wasn't supposed to happen!",
        message: "An error occured creating your post?.",
      });
    }
  };

  const handleUploadVideo = async (post) => {
    const token = await getItemAsync("authToken");
    const url = compressedFileUrl
      ? Platform.OS == "android"
        ? compressedFileUrl?.replace("file://", "/")
        : compressedFileUrl
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
          console.log("Completed!");
        });
      })
      .catch((err) => {
        console.log("Upload error!", err);
      });
  };
  // };

  const createPost = async () => {
    setLoading(true);
    await handlePostCreation().then(async (post) => {
      if (file.type?.split("/")[0] === "video") {
        await handleUploadVideo(post);
      }
      setPostBody("");
      setFile("");
      setRemoveMedia(false);
      dispatch({
        type: "SET_POST_CREATED",
        payload: { posted: true, type: "created" },
      });
      navigation.navigate("Home");
    });
    setLoading(false);
  };

  const handleCompression = async (media) => {
    const mediaInfo = await getInfoAsync(media?.uri);
    const mediaSizeInMb = mediaInfo?.size / 1000000;

    if (typeof mediaSizeInMb === "number" && mediaSizeInMb > 14) {
      if (media?.type === "video") {
        setCompressing(true);
        const url = await VideoCompress.compress(
          media.uri,
          {
            compressionMethod: "auto",
          },
          (progress) => {
            console.log({ compression: progress });
            setCompressionProgress(Math.ceil(progress * 100));
          }
        );
        setCompressedFileUrl(url);
        return url;
      }

      if (media?.type === "image") {
        setCompressing(true);
        const url = await ImageCompress.compress(
          media.uri,
          {
            compressionMethod: "auto",
          },
          (progress) => {
            console.log({ compression: progress });
            setCompressionProgress(Math.ceil(progress * 100));
          }
        );
        setCompressedFileUrl(url);
        return url;
      }
    }
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
      if (!result.cancelled) {
        const mediaInfo = await getInfoAsync(result.uri);
        const mediaSizeInMb = mediaInfo.size / 1000000;
        if (mediaSizeInMb > 100) {
          setShowMediaSizeError(true);
          setFile({ ...result, ...mediaInfo });
          return;
        }
        setShowMediaSizeError(false);
        setCompressing(false);
        setCompressionProgress(0);
        setFile({ ...result, ...mediaInfo });
        await handleCompression(result);
      }
    }
  };
  useEffect(() => {
    if (existingPost) {
      setPostBody(existingPost?.body);
    }
    const unsubscribe = navigation.addListener("blur", () => {
      if (existingPost) {
        setPostBody("");
      }
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation, existingPost]);

  if (loading) {
    return (
      <ActivityIndicator
        animating
        color={themeStyle.colors.primary.default}
        size={"large"}
      />
    );
  }

  if (cameraActive && isFocused) {
    return (
      <CameraStandard
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
            {existingPost ? "Edit Post" : "New Post"}
          </Text>
          {existingPost?.body !== postBody ||
          (existingPost?.mediaUrl && removeMedia) ? (
            <View>
              <TouchableOpacity
                onPress={() => {
                  setRemoveMedia(false);
                  setPostBody(existingPost.body || "");
                }}
              >
                <Text
                  style={{
                    color: themeStyle.colors.secondary.default,
                    fontSize: 16,
                  }}
                >
                  Undo changes
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
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
          {file.uri || (existingPost?.mediaType && !removeMedia) ? (
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
                  setRemoveMedia(true);
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
              {compressing ? (
                <Text
                  style={{
                    marginHorizontal: 5,
                    marginBottom: 5,
                    color: themeStyle.colors.secondary.default,
                  }}
                >
                  {compressionProgress < 100 ? "Processing..." : "Processed"}
                </Text>
              ) : null}
              <View
                style={{
                  height: 5,
                  width: `${compressionProgress}%`,
                  backgroundColor: themeStyle.colors.secondary.default,
                }}
              />
              {file.type?.split("/")[0] === "video" ? (
                <View
                  style={{
                    height: screenWidth,
                    alignItems: "center",
                    padding: 20,
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
                    padding: 20,
                  }}
                >
                  <ImageWithCache
                    mediaOrientation={file.mediaOrientation}
                    mediaIsSelfie={file.isSelfie}
                    resizeMode="contain"
                    mediaUrl={file.uri}
                    aspectRatio={1 / 1}
                    removeBorderRadius
                  />
                </View>
              ) : existingPost?.mediaType === "video" && !removeMedia ? (
                <View
                  style={{
                    height: screenWidth,
                    alignItems: "center",
                    padding: 20,
                  }}
                >
                  <VideoPlayer
                    autoHidePlayer={false}
                    fullscreen
                    mediaIsSelfie
                    videoProps={{
                      shouldPlay: true,
                      resizeMode: Video.RESIZE_MODE_CONTAIN,
                      source: {
                        uri: existingPost?.mediaUrl,
                      },
                    }}
                    style={{ height: 300 }}
                  />
                </View>
              ) : existingPost?.mediaType === "image" && !removeMedia ? (
                <View
                  style={{
                    height: screenWidth - 40,
                    alignItems: "center",
                    padding: 20,
                  }}
                >
                  <ImageWithCache
                    mediaOrientation={existingPost?.mediaOrientation}
                    mediaIsSelfie={existingPost?.isSelfie}
                    resizeMode="contain"
                    mediaUrl={existingPost?.mediaUrl}
                    aspectRatio={1 / 1}
                    removeBorderRadius
                    mediaHeaders={existingPost?.mediaHeaders}
                  />
                </View>
              ) : null}
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
          </View>
          <View
            style={{
              justifyContent: "center",
              flexDirection: "row",
              backgroundColor: themeStyle.colors.primary.default,
              padding: 5,
              borderRadius: 20,
              width: 70,
              opacity:
                (removeMedia && !postBody) ||
                (!existingPost && !file?.uri && !postBody)
                  ? 0.5
                  : 1,
            }}
          >
            <TouchableOpacity
              disabled={
                (removeMedia && !postBody) ||
                (!existingPost && !file && !postBody)
              }
              onPress={() => createPost()}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: themeStyle.colors.white,
                }}
              >
                Post
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {error ? (
          <View>
            <Text style={styles.errorTitle}>{error.title}</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
          </View>
        ) : null}
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
  errorTitle: {
    textAlign: "center",
    color: themeStyle.colors.error.default,
    fontSize: 16,
  },
  errorMessage: {
    textAlign: "center",
    color: themeStyle.colors.error.default,
    fontSize: 14,
  },
});

export default AddScreen;
