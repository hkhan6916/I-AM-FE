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
import VideoPlayer from "../../../components/VideoPlayer";
import { LinearGradient } from "expo-linear-gradient";
import { backgroundUpload } from "react-native-compressor";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

const AddScreen = () => {
  const isFocused = useIsFocused();
  const [postBody, setPostBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showMediaSizeError, setShowMediaSizeError] = useState(false);

  const navigation = useNavigation();

  const dispatch = useDispatch();

  const createPostData = async () => {
    const postData = new FormData();

    if (file.uri) {
      const { type, name, uri, orientation, isSelfie } = file;
      const format = uri.split(".").pop();
      postData.append("file", {
        type: type.split("/").length > 1 ? type : `${type}/${format}`,
        name: name || `media.${format}`,
        uri,
      });
      postData.append("mediaOrientation", orientation || "");
      postData.append("mediaIsSelfie", isSelfie || false);
    }

    if (postBody) {
      postData.append("postBody", postBody);
    }

    return postData;
  };

  const createPost = async () => {
    setLoading(true);
    const postData = await createPostData();

    const { success } = await apiCall("POST", "/posts/new", postData);
    if (success) {
      setPostBody("");
      setFile("");
      dispatch({
        type: "SET_POST_CREATED",
        payload: { posted: true, type: "created" },
      });
      navigation.navigate("Home");
    } else {
      setError({
        title: "Well... that wasn't supposed to happen!",
        message: "An error occured creating your post.",
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
        (progress) => console.log(progress)
      );
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
        if (mediaSizeInMb > 50) {
          setShowMediaSizeError(true);
          setFile({ ...result, ...mediaInfo });
          return;
        }
        const url = await handleCompression(result);

        if (showMediaSizeError) {
          setShowMediaSizeError(false);
        }
        setFile({ ...result, uri: url, ...mediaInfo });
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
              <VideoPlayer
                url={file.uri}
                mediaHeaders={null}
                showToggle
                isLocalMedia
              />
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
