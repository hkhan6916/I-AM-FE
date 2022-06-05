import React, { Fragment, useEffect, useState } from "react";

import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  Dimensions,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import {
  FontAwesome,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import themeStyle from "../../../theme.style";
import apiCall from "../../../helpers/apiCall";
import ImageWithCache from "../../../components/ImageWithCache";
import ExpoVideoPlayer from "../../../components/ExpoVideoPlayer";
import { StatusBar } from "expo-status-bar";
import VideoPlayer from "react-native-video-controls";
import useScreenOrientation from "../../../helpers/hooks/useScreenOrientation";
const MediaScreen = (props) => {
  const { post: initialPost } = props.route.params;
  const [liked, setLiked] = useState(initialPost.liked);
  const [likes, setLikes] = useState(initialPost.likes);
  const [post, setPost] = useState(initialPost);
  const { width: screenWidth } = Dimensions.get("window");

  const isFocused = useIsFocused();

  const navigation = useNavigation();

  const getAdditionalPostData = async () => {
    const { success, response } = await apiCall(
      "POST",
      `/posts/${post?._id}/additionaldata`
    );
    if (success) {
      setLikes(response.likes);
      setLiked(response.liked);
      setPost({ ...post, liked: response.liked, likes: response.likes });
    }
  };

  const intToString = (value) => {
    var suffixes = ["", "k", "m", "b", "t"];
    var suffixNum = Math.floor(("" + value).length / 3);
    var shortValue = parseFloat(
      (suffixNum != 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(
        2
      )
    );
    if (shortValue % 1 != 0) {
      shortValue = shortValue.toFixed(1);
    }
    return shortValue + suffixes[suffixNum];
  };

  const handleReaction = async () => {
    if (liked) {
      setLikes(likes - 1);
      setLiked(false);

      const { success } = await apiCall(
        "GET",
        `/posts/like/remove/${post._id}`
      );
      if (!success) {
        setLikes(likes + 1);
        setLiked(true);
      }
    } else {
      setLikes(likes + 1);
      setLiked(true);
      const { success } = await apiCall("GET", `/posts/like/add/${post._id}`);
      if (!success) {
        setLikes(likes);
        setLiked(false);
      }
    }
  };

  useScreenOrientation(true);

  useEffect(() => {
    (async () => {
      await getAdditionalPostData();
      if (post?.mediaType === "video") {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.DEFAULT
        );
      }
    })();
    return async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  return (
    <Fragment>
      <SafeAreaView
        style={{
          flex: 0,
          backgroundColor: themeStyle.colors.black,
        }}
      />
      <StatusBar hidden />
      <SafeAreaView style={styles.container}>
        <View>
          {post?.mediaType === "video" ? (
            <ExpoVideoPlayer
              isSelfie={post.mediaIsSelfie}
              uri={post.mediaUrl}
            />
          ) : // <VideoPlayer
          //   source={{ uri: post.mediaUrl }}
          //   navigator={navigation}
          //   videoStyle={{
          //     transform: [{ scaleX: post.mediaIsSelfie ? -1 : 1 }],
          //     // height: "100%",
          //   }}
          //   onError={(e) => console.log(e)}
          //   style={{ width: screenWidth }}
          //   paused={!isFocused}
          //   disableFullscreen
          //   fullscreen={false}
          //   controlAnimationTiming={100}
          //   // scrubbing={1000}
          // />
          post?.mediaType === "image" ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ImageWithCache
                mediaIsSelfie={post.mediaIsSelfie}
                resizeMode="contain"
                mediaHeaders={post.mediaHeaders}
                mediaUrl={post.mediaUrl}
                removeBorderRadius
                style={{ backgroundColor: themeStyle.colors.black }}
              />
            </View>
          ) : null}
          {post?.mediaType === "image" ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                position: "absolute",
                left: 20,
                top: 20,
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="chevron-back"
                  size={26}
                  color={themeStyle.colors.grayscale.low}
                  style={styles.iconShadow}
                />
              </View>
            </TouchableOpacity>
          ) : null}
          <TouchableWithoutFeedback>
            <View
              style={{
                position: "absolute",
                bottom: 100,
                right: 0,
                borderRadius: 20,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <TouchableOpacity
                onPress={async () => {
                  await ScreenOrientation.lockAsync(
                    ScreenOrientation.OrientationLock.PORTRAIT_UP
                  );
                  navigation.navigate("CommentsScreen", {
                    postId: post._id,
                  });
                }}
              >
                <Text
                  style={{
                    color: themeStyle.colors.white,
                    margin: 20,
                    width: 30,
                    height: 30,
                    textAlign: "center",
                  }}
                >
                  <FontAwesome
                    style={styles.iconShadow}
                    name="comment-o"
                    size={24}
                  />
                </Text>
              </TouchableOpacity>
              {!post.belongsToUser ? (
                <TouchableOpacity onPress={() => handleReaction()}>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: themeStyle.colors.white,
                        marginHorizontal: 20,
                        width: 30,
                        height: 30,
                        textAlign: "center",
                      }}
                    >
                      <MaterialCommunityIcons
                        name={liked ? "thumb-up" : "thumb-up-outline"}
                        size={24}
                        style={[
                          styles.iconShadow,
                          {
                            color: liked
                              ? themeStyle.colors.secondary.default
                              : themeStyle.colors.white,
                          },
                        ]}
                      />
                    </Text>
                    <Text
                      style={[
                        styles.text,
                        { minWidth: 20, textAlign: "center" },
                      ]}
                    >
                      {intToString(likes)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </SafeAreaView>
      <SafeAreaView
        style={{
          flex: 0,
          backgroundColor: themeStyle.colors.black,
        }}
      />
    </Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: themeStyle.colors.black,
  },
  text: {
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 5,
    textShadowColor: themeStyle.colors.black,
    color: themeStyle.colors.white,
  },
  iconShadow: {
    color: themeStyle.colors.white,
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 8,
    textShadowColor: themeStyle.colors.black,
  },
});

export default MediaScreen;
