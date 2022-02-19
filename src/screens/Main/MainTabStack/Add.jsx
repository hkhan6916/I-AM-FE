import React, { useState } from "react";
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
import {
  uploadAsync,
  FileSystemHttpMethods,
  FileSystemSessionType,
  FileSystemUploadType,
} from "expo-file-system";
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

const BACKGROUND_FETCH_TASK = "background-fetch";

// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const now = Date.now();

  console.log(
    `Got background fetch call at date: ${new Date(now).toISOString()}`
  );
  await apiCall("GET", "/user/test/test");

  // Be sure to return the successful result type!
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

const AddScreen = () => {
  const isFocused = useIsFocused();
  const [postBody, setPostBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showMediaSizeError, setShowMediaSizeError] = useState(false);
  const [post, setPost] = useState(null);
  const navigation = useNavigation();

  const dispatch = useDispatch();

  const createPostData = async () => {
    const postData = new FormData();
    if (file.uri) {
      const { type, name, uri, orientation, isSelfie } = file;
      if (type.split("/")[0] === "video") {
        // just add thumbnail for videos. We'll add the rest of the media later.
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
    const { success, message, response } = await apiCall(
      "POST",
      "/posts/new",
      postData
    );
    console.log(message);
    if (success) {
      // // This needs to be the last step!
      // setPostBody("");
      // setFile("");
      // dispatch({
      //   type: "SET_POST_CREATED",
      //   payload: { posted: true, type: "created" },
      // });
      // navigation.navigate("Home");

      setPost(response.post);
      return response.post;
    } else {
      setError({
        title: "Well... that wasn't supposed to happen!",
        message: "An error occured creating your post.",
      });
    }
  };

  const handleUploadVideo = async (post) => {
    const token = await getItemAsync("authToken");
    const options = {
      url: "http://192.168.5.101:5000/posts/new",
      path:
        Platform.OS == "android"
          ? file?.uri?.replace("file://", "")
          : file?.uri,
      method: "POST",
      type: "multipart",
      maxRetries: 2, // set retry count (Android only). Default 2
      headers: {
        "content-type": "multipart/form-data", // Customize content-type
        Authorization: `Bearer ${token}`,
      },
      parameters: {
        postId: post._id,
      },
      field: "file",
      // Below are options only supported on Android
      notification: {
        enabled: true,
      },
      useUtf8Charset: true,
    };
    if (file.uri && post?._id) {
      // compress in background and .then (()=>startupload)
      Upload.startUpload(options)
        .then((uploadId) => {
          setPost(null);
          console.log("Upload started");
          Upload.addListener("progress", uploadId, (data) => {
            console.log(`Progress: ${data.progress}%`);
            console.log(data);
          });
          Upload.addListener("error", uploadId, (data) => {
            console.log(`Error: ${data.error}%`);
          });
          Upload.addListener("cancelled", uploadId, (data) => {
            console.log(`Cancelled!`);
          });
          Upload.addListener("completed", uploadId, (data) => {
            // data includes responseCode: number and responseBody: Object
            console.log("Completed!");
          });
        })
        .catch((err) => {
          console.log("Upload error!", err);
        });
    }
  };

  const createPost = async () => {
    setLoading(true);
    if (!post?._id) {
      await handlePostCreation().then(async (post) => {
        await handleUploadVideo(post);
      });
    }
    setLoading(false);
  };

  const handleCompression = async (media) => {
    if (media?.type === "video") {
      const url = await VideoCompress.compress(
        media.uri,
        {
          compressionMethod: "auto",
        },
        (progress) => {
          // console.log(progress);
        }
      ).then(async (result) => {
        console.log(result);
        // await apiCall("GET", "/user/test/test");
        return result;
      });
      return url;
    }

    if (media?.type === "image") {
      const url = await ImageCompress.compress(media.uri, {
        compressionMethod: "auto",
      });
      return url;
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work.");
    }

    if (status === "granted") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        // mediaTypes: ImagePicker.MediaTypeOptions.Images, // if we only allow images
        quality: 0.3,
      });
      if (!result.cancelled) {
        const mediaInfo = await getInfoAsync(result.uri);
        const mediaSizeInMb = mediaInfo.size / 1000000;
        if (mediaSizeInMb > 500) {
          setShowMediaSizeError(true);
          setFile({ ...result, ...mediaInfo });
          return;
        }
        setFile({ ...result, ...mediaInfo });
        // const url = await handleCompression(result);

        // if (showMediaSizeError) {
        //   setShowMediaSizeError(false);
        // }
        // setFile({ ...result, uri: url, ...mediaInfo });
      }
    }
  };

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
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => handleCompression()}>
        <Text>Test</Text>
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 24,
          color: themeStyle.colors.primary.default,
          marginBottom: 20,
        }}
      >
        New Post
      </Text>
      {postBody.length >= 1000 - 25 ? (
        <Text style={styles.postLimitMessage}>
          {2000 - postBody.length} Characters Remaining
        </Text>
      ) : null}
      <ScrollView>
        <TextInput
          style={{ minHeight: 100, textAlignVertical: "top", fontSize: 16 }}
          value={postBody}
          placeholder="What's on your mind?"
          placeholderTextColor={themeStyle.colors.grayscale.lightGray}
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
              onPress={() => setFile({})}
            >
              <AntDesign
                name="close"
                size={24}
                color={themeStyle.colors.grayscale.black}
              />
            </TouchableOpacity>
            {showMediaSizeError ? (
              <Text
                style={{
                  color: themeStyle.colors.error.default,
                  marginHorizontal: 5,
                }}
              >
                Choose a file smaller than 50MB
              </Text>
            ) : null}
            {file.type?.split("/")[0] === "video" ? (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <VideoPlayer
                  videoProps={{
                    resizeMode: Video.RESIZE_MODE_CONTAIN,
                    source: {
                      uri: file.uri,
                    },
                    style: { width: "100%", height: "100%" },
                  }}
                  // fullscreen={true}
                />
              </View>
            ) : file.type?.split("/")[0] === "image" ? (
              <ImageWithCache
                mediaOrientation={file.mediaOrientation}
                mediaIsSelfie={file.isSelfie}
                resizeMode="cover"
                mediaUrl={file.uri}
                aspectRatio={1 / 1}
                removeBorderRadius
              />
            ) : null}
          </View>
        ) : null}
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: 10,
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
                color={themeStyle.colors.grayscale.black}
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
            <TouchableOpacity onPress={() => pickImage()}>
              <FontAwesome
                name="image"
                size={24}
                color={themeStyle.colors.grayscale.black}
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
          }}
        >
          <TouchableOpacity onPress={() => createPost()}>
            <Text
              style={{
                fontSize: 16,
                color: themeStyle.colors.grayscale.white,
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
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
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
