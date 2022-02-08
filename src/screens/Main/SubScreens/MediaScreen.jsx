import React, { useEffect, useState } from "react";

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
import VideoPlayer from "../../../components/VideoPlayer";
import themeStyle from "../../../theme.style";
import apiCall from "../../../helpers/apiCall";
import ImageWithCache from "../../../components/ImageWithCache";

const MediaScreen = (props) => {
  const [showActions, setShowActions] = useState(false);
  const { post } = props.route.params;
  const [liked, setLked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const navigation = useNavigation();

  const handleReaction = async () => {
    if (liked) {
      setLikes(likes - 1);
      setLked(false);

      const { success } = await apiCall(
        "GET",
        `/posts/like/remove/${post._id}`
      );
      if (!success) {
        setLikes(likes + 1);
        setLked(true);
      }
    } else {
      setLikes(likes + 1);
      setLked(true);
      const { success } = await apiCall("GET", `/posts/like/add/${post._id}`);
      if (!success) {
        setLikes(likes - 1);
        setLked(false);
      }
    }
  };
  useEffect(() => {
    (async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.DEFAULT
      );
    })();
    return async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT
      );
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View>
        {post?.mediaType === "video" ? (
          <VideoPlayer
            url={post.mediaUrl}
            mediaHeaders={post.mediaHeaders}
            mediaOrientation={post.mediaOrientation}
            mediaIsSelfie={post.mediaIsSelfie}
            isFullScreen
            setShowActions={setShowActions}
          />
        ) : post?.mediaType === "image" ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImageWithCache
              mediaOrientation={post.mediaOrientation}
              mediaIsSelfie={post.mediaIsSelfie}
              resizeMode="cover"
              mediaHeaders={post.mediaHeaders}
              mediaUrl={post.mediaUrl}
              removeBorderRadius
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
              opacity: showActions ? 1 : 0.5,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={26}
              color={themeStyle.colors.grayscale.white}
            />
            <Text
              style={{ color: themeStyle.colors.grayscale.white, fontSize: 16 }}
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
              opacity: post.mediaType !== "video" ? 1 : showActions ? 1 : 0.2,
              borderRadius: 20,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CommentsScreen", {
                  postId: post._id,
                })
              }
            >
              <Text
                style={{ color: themeStyle.colors.grayscale.white, margin: 20 }}
              >
                <FontAwesome
                  name="comment-o"
                  size={24}
                  color={themeStyle.colors.grayscale.white}
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
                      color: themeStyle.colors.grayscale.white,
                      marginHorizontal: 20,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={liked ? "thumb-up" : "thumb-up-outline"}
                      size={24}
                      color={
                        liked
                          ? themeStyle.colors.secondary.default
                          : themeStyle.colors.grayscale.white
                      }
                    />
                  </Text>
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.white,
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: themeStyle.colors.grayscale.black,
  },
});

export default MediaScreen;
