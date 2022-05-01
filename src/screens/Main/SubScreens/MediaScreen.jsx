import React, { Fragment, useEffect, useState } from "react";

import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import {
  FontAwesome,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import themeStyle from "../../../theme.style";
import apiCall from "../../../helpers/apiCall";
import ImageWithCache from "../../../components/ImageWithCache";
import ExpoVideoPlayer from "../../../components/ExpoVideoPlayer";
import { StatusBar } from "expo-status-bar";
const MediaScreen = (props) => {
  const { post: initialPost } = props.route.params;
  const [liked, setLiked] = useState(initialPost.liked);
  const [likes, setLikes] = useState(initialPost.likes);
  const [post, setPost] = useState(initialPost);
  console.log(post.mediaUrl);
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
      const { success, message } = await apiCall(
        "GET",
        `/posts/like/add/${post._id}`
      );
      console.log(message);
      if (!success) {
        setLikes(likes);
        setLiked(false);
      }
    }
  };

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
          backgroundColor: themeStyle.colors.grayscale.highest,
        }}
      />
      <StatusBar hidden />
      <SafeAreaView style={styles.container}>
        <View>
          {post?.mediaType === "video" ? (
            <ExpoVideoPlayer uri={post.mediaUrl} />
          ) : post?.mediaType === "image" ? (
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
                style={{ backgroundColor: themeStyle.colors.grayscale.highest }}
              />
            </View>
          ) : null}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              position: "absolute",
              left: 10,
              top: 10,
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
                name="arrow-back"
                size={26}
                color={themeStyle.colors.grayscale.low}
              />
              <Text
                style={{
                  color: themeStyle.colors.grayscale.low,
                  fontSize: 16,
                }}
              >
                Back
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableWithoutFeedback>
            <View
              style={{
                position: "absolute",
                bottom: 70,
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
                    color: themeStyle.colors.grayscale.lowest,
                    margin: 20,
                  }}
                >
                  <FontAwesome
                    name="comment-o"
                    size={24}
                    color={themeStyle.colors.grayscale.lowest}
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
                        color: themeStyle.colors.grayscale.lowest,
                        marginHorizontal: 20,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={liked ? "thumb-up" : "thumb-up-outline"}
                        size={24}
                        color={
                          liked
                            ? themeStyle.colors.secondary.default
                            : themeStyle.colors.grayscale.lowest
                        }
                      />
                    </Text>
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.lowest,
                        marginHorizontal: 20,
                      }}
                    >
                      {likes}
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
          backgroundColor: themeStyle.colors.grayscale.highest,
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
    backgroundColor: themeStyle.colors.grayscale.highest,
  },
});

export default MediaScreen;
