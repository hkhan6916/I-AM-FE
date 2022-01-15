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
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { Video } from "expo-av";
import themeStyle from "../../../theme.style";
import apiCall from "../../../helpers/apiCall";
import CameraStandard from "../../../components/CameraStandard";
import ImageWithCache from "../../../components/ImageWithCache";

const AddScreen = () => {
  const isFocused = useIsFocused();
  const [postBody, setPostBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const navigation = useNavigation();

  const dispatch = useDispatch();

  const createPostData = async () => {
    const postData = new FormData();
    if (file.uri) {
      const { type, name, uri, orientation, isSelfie } = file;
      postData.append("file", {
        type,
        name,
        uri,
      });
      postData.append("mediaOrientation", orientation);
      postData.append("mediaIsSelfie", isSelfie);
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
      setLoading(false);
      navigation.navigate("Home");
    } else {
      setError({
        title: "Well... that wasn't supposed to happen!",
        message: "An error occured creating your post.",
      });
    }
  };

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
      <KeyboardAvoidingView keyboardVerticalOffset={200}>
        <Button title="Done" onPress={() => Keyboard.dismiss()} />
        {postBody.length >= 1000 - 25 ? (
          <Text style={styles.postLimitMessage}>
            {1000 - postBody.length} Characters Remaining
          </Text>
        ) : null}
        {file.type?.split("/")[0] === "video" ? (
          <Video
            style={{
              alignSelf: "center",
              width: 320,
              height: 200,
              backgroundColor: themeStyle.colors.grayscale.black,
            }}
            source={{
              uri: file.uri,
            }}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
        ) : file.type?.split("/")[0] === "image" ? (
          <ImageWithCache
            mediaOrientation={file.mediaOrientation}
            mediaIsSelfie={file.isSelfie}
            resizeMode="cover"
            mediaUrl={file.uri}
            aspectRatio={1 / 1}
          />
        ) : null}
        <ScrollView>
          <TextInput
            style={{ minHeight: 100, textAlignVertical: "top" }}
            value={postBody}
            placeholder="What's on your mind?"
            placeholderTextColor={themeStyle.colors.grayscale.lightGray}
            multiline
            maxLength={1000}
            onChangeText={(v) => setPostBody(v)}
          />
        </ScrollView>
        <Button title="Camera" onPress={() => setCameraActive(true)} />
        <Button
          disabled={(!postBody && !file) || loading || postBody.length >= 1000}
          title="Make Post"
          onPress={() => createPost()}
        />
        {error ? (
          <View>
            <Text style={styles.errorTitle}>{error.title}</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
