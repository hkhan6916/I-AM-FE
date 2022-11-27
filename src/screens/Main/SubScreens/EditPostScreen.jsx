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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import themeStyle from "../../../theme.style";
import apiCall from "../../../helpers/apiCall";
import ImageWithCache from "../../../components/ImageWithCache";
import RepostCard from "../../../components/RepostCard";
import VideoPlayer from "expo-video-player";
import { AntDesign } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Video } from "expo-av";

const EditPostScreen = (props) => {
  const [postBody, setPostBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState();
  const [existingPost, setExistingPost] = useState(null);
  const [removeMedia, setRemoveMedia] = useState(false);

  const navigation = useNavigation();

  const { width: screenWidth } = Dimensions.get("window");

  const { postId } = props.route.params;

  const handlePostUpdate = async () => {
    const postData = {
      postBody,
      removeMedia,
    };
    const { success } = await apiCall(
      "POST",
      `/posts/update/${existingPost?._id}`,
      postData
    );
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

  const updatePost = async () => {
    setLoading(true);
    setError(null);
    await handlePostUpdate();
    setLoading(false);
  };

  const validateInfo = () => {
    // if post body made empty but still have media or gif in post
    if (postBody) {
      return false;
    }
    if (removeMedia && (postBody || existingPost?.body)) {
      return false;
    }

    if ((!postBody || !existingPost?.body) && removeMedia) {
      return true;
    }
  };

  useEffect(() => {
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
  }, [navigation, postId]);
  if (loading) {
    return (
      <ActivityIndicator
        animating
        color={themeStyle.colors.primary.default}
        size={"large"}
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
        <ScrollView
          contentContainerStyle={{
            padding: 10,
            maxWidth: 900,
            alignSelf: "center",
            width: "100%",
          }}
        >
          {postBody.length >= 2000 - 25 ? (
            <Text style={styles.postLimitMessage}>
              {2000 - postBody.length} Characters Remaining
            </Text>
          ) : existingPost?.hidden ? (
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                textAlign: "center",
                fontWeight: "700",
              }}
            >
              This post is hidden and under review
            </Text>
          ) : null}
          {success ? (
            <Text
              style={{
                color: themeStyle.colors.success.default,
                marginVertical: 10,
                fontSize: 16,
              }}
            >
              Post updated
            </Text>
          ) : null}
          <TextInput
            editable={!existingPost?.hidden}
            style={{
              minHeight: 100,
              textAlignVertical: "top",
              fontSize: 16,
              color: themeStyle.colors.grayscale.lowest,
            }}
            value={postBody}
            placeholder="What's on your mind?"
            placeholderTextColor={themeStyle.colors.grayscale.low}
            multiline
            maxLength={2000}
            onChangeText={(v) => setPostBody(v)}
          />

          {existingPost &&
          (existingPost?.body !== postBody ||
            ((existingPost?.mediaUrl || existingPost?.gif) && removeMedia)) ? (
            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginVertical: 20 }}
              onPress={() => {
                setRemoveMedia(false);
                setPostBody(existingPost?.body || "");
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
          !existingPost?.repostPostId &&
          (existingPost?.mediaUrl ||
            existingPost?.thumbnailUrl ||
            existingPost?.gif) ? (
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.4)",
                borderRadius: 10,
              }}
            >
              <TouchableOpacity
                style={{ alignSelf: "flex-end" }}
                onPress={() => {
                  setRemoveMedia(true);
                }}
              >
                <AntDesign
                  name="close"
                  size={24}
                  color={themeStyle.colors.grayscale.lowest}
                />
              </TouchableOpacity>
              {existingPost?.gif ? (
                <View
                  style={{
                    height: screenWidth - 40,
                    alignItems: "center",
                    padding: 5,
                  }}
                >
                  <Video
                    resizeMode="contain"
                    style={{ width: "100%", height: "100%" }}
                    source={{ uri: existingPost?.gif }}
                    posterSource={existingPost?.gifPreview}
                    shouldPlay
                    isLooping
                  />
                </View>
              ) : existingPost?.mediaType === "video" ? (
                <View
                  style={{
                    alignItems: "center",
                    padding: 20,
                  }}
                >
                  {existingPost?.ready ? (
                    <VideoPlayer
                      autoHidePlayer={false}
                      fullscreen
                      mediaIsSelfie
                      videoProps={{
                        shouldPlay: false,
                        resizeMode: "contain",
                        source: {
                          uri: existingPost?.mediaUrl,
                        },
                      }}
                      style={{ height: screenWidth > 500 ? 500 : screenWidth }}
                    />
                  ) : (
                    <View>
                      <Text
                        style={{
                          position: "absolute",
                          fontSize: 20,
                          color: themeStyle.colors.white,
                          zIndex: 1,
                          textAlign: "center",
                          margin: 10,
                          textShadowOffset: {
                            width: 1,
                            height: 1,
                          },
                          textShadowRadius: 8,
                          textShadowColor: themeStyle.colors.black,
                        }}
                      >
                        {"Uploading..."}
                      </Text>

                      <ImageWithCache
                        removeBackround
                        removeBorderRadius
                        resizeMode="contain"
                        mediaUrl={existingPost?.thumbnailUrl}
                        mediaHeaders={existingPost?.thumbnailHeaders}
                        aspectRatio={1 / 1}
                        mediaIsSelfie={existingPost?.mediaIsSelfie}
                        style={{
                          height: screenWidth > 500 ? 500 : screenWidth,
                        }}
                      />
                    </View>
                  )}
                </View>
              ) : existingPost?.mediaType === "image" ? (
                <View
                  style={{
                    alignItems: "center",
                    padding: 20,
                  }}
                >
                  <ImageWithCache
                    removeBackround
                    removeBorderRadius
                    resizeMode="contain"
                    mediaIsSelfie={existingPost?.isSelfie}
                    mediaUrl={existingPost?.mediaUrl}
                    aspectRatio={1 / 1}
                    mediaHeaders={existingPost?.mediaHeaders}
                  />
                </View>
              ) : null}
            </View>
          ) : null}
          {existingPost?.repostPostId ? (
            <RepostCard
              postContent={existingPost?.repostPostObj}
              mediaIsFullWidth
              isPreview
            />
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
          <View />
          <View
            style={{
              justifyContent: "center",
              flexDirection: "row",
              backgroundColor: themeStyle.colors.primary.default,
              padding: 5,
              borderRadius: 20,
              width: 70,
              opacity: validateInfo() || existingPost?.hidden ? 0.5 : 1,
            }}
          >
            <TouchableOpacity
              disabled={validateInfo() || existingPost?.hidden}
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
