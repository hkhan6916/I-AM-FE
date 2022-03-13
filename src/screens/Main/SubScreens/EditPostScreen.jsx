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
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
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
import RepostCard from "../../../components/RepostCard";
import VideoPlayer from "expo-video-player";
import {
  AntDesign,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { getThumbnailAsync } from "expo-video-thumbnails";
import Upload from "react-native-background-upload";
import { getItemAsync } from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import GifModal from "../../../components/GifModal";

const EditPostScreen = (props) => {
  const isFocused = useIsFocused();
  const [postBody, setPostBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState();
  const [file, setFile] = useState({});
  const [existingPost, setExistingPost] = useState(null);
  const [compressedFileUrl, setCompressedFileUrl] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [showMediaSizeError, setShowMediaSizeError] = useState(false);
  const [removeMedia, setRemoveMedia] = useState(false);
  const [showGifsModal, setShowGifsModal] = useState(false);
  const [gif, setGif] = useState("");

  const navigation = useNavigation();

  const { width: screenWidth } = Dimensions.get("window");

  const { postId } = props.route.params;
  const createPostData = async () => {
    const postData = new FormData();
    if (typeof postBody === "string") {
      postData.append("postBody", postBody);
    }
    if (gif) {
      // if there's a gif, skip everything and just upload the gif
      postData.append("gif", gif);
      return postData;
    }
    if (file.uri) {
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
        const format = uri.split(".").pop();
        postData.append("file", {
          type: type.split("/").length > 1 ? type : `${type}/${format}`,
          name: name || `media.${format}`,
          uri,
        });
        postData.append("mediaIsSelfie", isSelfie || false);
      }
    }
    postData.append("removeMedia", removeMedia);

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

  const handlePostUpdate = async () => {
    const postData = await createPostData();
    const { success, message } = await apiCall(
      "POST",
      `/posts/update/${existingPost?._id}`,
      postData
    );
    console.log(message);
    setSuccess(success);
    if (success) {
      setExistingPost({ ...existingPost, body: postBody });
      return existingPost;
    } else {
      setError({
        title: "Error",
        message: "An error occurred updating your post.",
      });
      return;
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

  const updatePost = async () => {
    setLoading(true);
    setError(null);
    await handlePostUpdate().then(async (post) => {
      if (!post) return;
      if (file.type?.split("/")[0] === "video") {
        await handleUploadVideo(post);
      }
      setFile("");
      setRemoveMedia(false);
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
      setGif("");
      setRemoveMedia(false);
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

  const handleGifSelect = (gifUrl) => {
    setFile({});
    setRemoveMedia(false);
    setGif(gifUrl);
  };

  const validateInfo = () => {
    // if new file or gif added, all good
    if ((file.uri || gif) && !removeMedia) {
      return false;
    }
    // check if any data is present
    if (removeMedia && !postBody) {
      return true;
    }
    // check if no new post body added
    if (postBody === existingPost?.body || !postBody) {
      return true;
    }
  };

  useEffect(() => {
    if (cameraActive) {
      navigation.setOptions({ headerShown: false });
    } else {
      navigation.setOptions({ headerShown: true });
    }
    if (postId) {
      (async () => {
        const { success, response } = await apiCall(
          "GET",
          `/posts/fetch/${postId}`
        );
        if (success) {
          setExistingPost(response);
          setPostBody(response.body || "");
        } else {
          setError({
            message: "An error occurred displaying your post.",
          });
        }
      })();
    }
  }, [navigation, postId, cameraActive]);

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
        <GifModal
          selectGif={handleGifSelect}
          active={showGifsModal}
          setShowModal={setShowGifsModal}
        />
        {postBody.length >= 2000 - 25 ? (
          <Text style={styles.postLimitMessage}>
            {2000 - postBody.length} Characters Remaining
          </Text>
        ) : null}
        {success ? (
          <Text
            style={{ color: themeStyle.colors.success.default, margin: 10 }}
          >
            Post updated.
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
          {existingPost &&
          (existingPost?.body !== postBody ||
            file?.uri ||
            gif ||
            (existingPost?.mediaUrl && removeMedia)) ? (
            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginVertical: 20 }}
              onPress={() => {
                setRemoveMedia(false);
                setPostBody(existingPost?.body || "");
                setCompressing(false);
                setCompressionProgress(0);
                setFile({});
                setGif("");
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
          ) : null}
          {!removeMedia &&
          (file.uri || gif || existingPost?.mediaUrl || existingPost?.gif) ? (
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
              {compressing && file?.uri ? (
                <View>
                  <Text
                    style={{
                      marginHorizontal: 5,
                      marginBottom: 5,
                      color: themeStyle.colors.secondary.default,
                    }}
                  >
                    {compressionProgress < 100 ? "Processing..." : "Processed"}
                  </Text>
                  <View
                    style={{
                      height: 5,
                      width: `${compressionProgress}%`,
                      backgroundColor: themeStyle.colors.secondary.default,
                    }}
                  />
                </View>
              ) : null}
              {gif ? (
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
              ) : file.type?.split("/")[0] === "video" ? (
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
                    mediaIsSelfie={file.isSelfie}
                    resizeMode="contain"
                    mediaUrl={file.uri}
                    aspectRatio={1 / 1}
                    removeBorderRadius
                  />
                </View>
              ) : existingPost?.gif ? (
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
                    source={{ uri: existingPost?.gif }}
                  />
                </View>
              ) : existingPost?.mediaType === "video" ? (
                <View
                  style={{
                    height: screenWidth,
                    alignItems: "center",
                    padding: 20,
                  }}
                >
                  {existingPost?.ready ? (
                    <VideoPlayer // TODO create new player as need to flip the media for selfie video without flipping the controls.
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
                  ) : (
                    <ImageWithCache
                      removeBorderRadius
                      resizeMode="cover"
                      mediaUrl={existingPost?.thumbnailUrl}
                      mediaHeaders={existingPost?.thumbnailHeaders}
                      aspectRatio={1 / 1}
                      mediaIsSelfie={existingPost?.mediaIsSelfi}
                    />
                  )}
                </View>
              ) : existingPost?.mediaType === "image" ? (
                <View
                  style={{
                    height: screenWidth - 40,
                    alignItems: "center",
                    padding: 20,
                  }}
                >
                  <ImageWithCache
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
          {existingPost?.repostPostId ? (
            <RepostCard postContent={existingPost?.repostPostObj} isPreview />
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
          {!existingPost?.repostPostId ? (
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
          ) : (
            <View /> // needed to fill up gap
          )}
          <View
            style={{
              justifyContent: "center",
              flexDirection: "row",
              backgroundColor: themeStyle.colors.primary.default,
              padding: 5,
              borderRadius: 20,
              width: 70,
              opacity: validateInfo() ? 0.5 : 1,
            }}
          >
            <TouchableOpacity
              disabled={validateInfo()}
              onPress={() => updatePost()}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: themeStyle.colors.white,
                }}
              >
                Update
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {error ? (
          <View>
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

export default EditPostScreen;
