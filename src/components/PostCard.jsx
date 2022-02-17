import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  MaterialCommunityIcons,
  FontAwesome,
  Ionicons,
} from "@expo/vector-icons";
import VideoPlayer from "./VideoPlayer";
import formatAge from "../helpers/formatAge";
import Avatar from "./Avatar";
import themeStyle from "../theme.style";
import apiCall from "../helpers/apiCall";
import ImageWithCache from "./ImageWithCache";
import RepostCard from "./RepostCard";

const PostCard = ({
  post: initialPost,
  hideActions = false,
  isPreview = false,
  isVisible,
}) => {
  const [post, setPost] = useState(initialPost);
  const [bodyCollapsed, setBodyCollapsed] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);

  const navigation = useNavigation();

  const onTextLayout = (e) => {
    setIsCollapsible(e.nativeEvent.lines.length >= 3);
  };
  const handleReaction = async () => {
    if (post.liked) {
      const newPost = { ...post, liked: false };
      newPost.likes -= 1;
      setPost(newPost);
      const { success } = await apiCall(
        "GET",
        `/posts/like/remove/${post._id}`
      );
      if (!success) {
        setPost(initialPost);
      }
    } else {
      const newPost = { ...post, liked: true };
      newPost.likes += 1;
      setPost(newPost);
      const { success } = await apiCall("GET", `/posts/like/add/${post._id}`);
      if (!success) {
        setPost(initialPost);
      }
    }
  };

  const PostAge = () => {
    const { age } = post;
    const ageObject = formatAge(age);

    return (
      <Text style={styles.postAge}>
        {ageObject.age} {ageObject.unit} ago
      </Text>
    );
  };

  // useEffect(() => {
  //   setPost(initialPost);
  // }, [initialPost]);

  return (
    <View style={[styles.container, isPreview && styles.preview]}>
      {post.postAuthor && (
        <View style={[styles.postAuthorContainer]}>
          <Avatar
            navigation={navigation}
            userId={post.postAuthor._id}
            size={50}
            avatarUrl={post.postAuthor.profileGifUrl}
            profileGifHeaders={post.postAuthor.profileGifHeaders}
          />
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              marginLeft: 20,
            }}
          >
            <Text
              numberOfLines={1}
              style={{ fontWeight: "700", maxWidth: 200 }}
            >
              {post.postAuthor.username}
            </Text>
            <Text style={{ maxWidth: 200 }} numberOfLines={1}>
              {post.postAuthor.firstName} {post.postAuthor.lastName}
            </Text>
            {post.postAuthor.jobTitle && (
              <Text
                numberOfLines={1}
                style={{
                  color: themeStyle.colors.grayscale.mediumGray,
                  maxWidth: 200,
                }}
              >
                {post.postAuthor.jobTitle}
              </Text>
            )}
          </View>
        </View>
      )}
      {post.repostPostObj ? (
        <View>
          <RepostCard postContent={post.repostPostObj} isPreview={isPreview} />
          {post.body ? (
            <View
              style={{
                padding: 5,
                marginHorizontal: 10,
              }}
            >
              <Text
                onTextLayout={onTextLayout}
                numberOfLines={!bodyCollapsed ? 3 : null}
                style={{ textAlign: "left" }}
              >
                {post.body}
              </Text>
              {isCollapsible && !bodyCollapsed ? (
                <TouchableOpacity onPress={() => setBodyCollapsed(true)}>
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.darkGray,
                      marginBottom: 10,
                      marginTop: 5,
                    }}
                  >
                    Read more
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : (
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("MediaScreen", { post })}
            underlayColor={themeStyle.colors.grayscale.mediumGray}
            delayPressIn={150}
          >
            <View>
              {post.mediaType === "video" ? (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <VideoPlayer
                    shouldPlay={isVisible}
                    mediaOrientation={post.mediaOrientation}
                    mediaIsSelfie={post.mediaIsSelfie}
                    url={post.mediaUrl}
                    thumbnailUrl={post.thumbnailUrl}
                    thumbnailHeaders={post.thumbnailHeaders}
                  />
                </View>
              ) : post.mediaType === "image" ? (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "column",
                  }}
                >
                  <ImageWithCache
                    removeBorderRadius
                    mediaHeaders={post.mediaHeaders}
                    mediaOrientation={post.mediaOrientation}
                    mediaIsSelfie={post.mediaIsSelfie}
                    resizeMode="cover"
                    mediaUrl={post.mediaUrl}
                    aspectRatio={1 / 1}
                  />
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
          {post.body ? (
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 20,
              }}
            >
              <Text
                onTextLayout={onTextLayout}
                numberOfLines={!bodyCollapsed ? 3 : null}
                style={{ textAlign: "left" }}
              >
                {post.body}
              </Text>
              {isCollapsible && !bodyCollapsed ? (
                <TouchableOpacity onPress={() => setBodyCollapsed(true)}>
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.darkGray,
                      marginBottom: 10,
                      marginTop: 5,
                    }}
                  >
                    Read more
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>
      )}
      {!hideActions && (
        <View>
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row" }}>
              {!post.belongsToUser ? (
                <TouchableOpacity
                  onPress={() => handleReaction()}
                  style={{
                    width: 40,
                    height: 40,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name={post.liked ? "thumb-up" : "thumb-up-outline"}
                    size={20}
                    color={
                      post.liked
                        ? themeStyle.colors.secondary.default
                        : themeStyle.colors.grayscale.black
                    }
                  />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("CommentsScreen", {
                    postId: post._id,
                  })
                }
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  marginHorizontal: 5,
                }}
              >
                <FontAwesome
                  name="comment-o"
                  size={20}
                  color={themeStyle.colors.grayscale.black}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("RepostScreen", {
                  prevScreen: "Home",
                  post: post.repostPostObj || post,
                })
              }
              style={{
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                marginHorizontal: 5,
                justifySelf: "flex-end",
              }}
            >
              <Ionicons
                name="arrow-redo-outline"
                size={22}
                color={themeStyle.colors.grayscale.black}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            {post.likedBy ? (
              <Text
                style={{
                  color: themeStyle.colors.grayscale.mediumGray,
                  fontSize: 12,
                  marginHorizontal: 10,
                  marginVertical: 5,
                }}
              >
                Liked by{" "}
                <Text
                  style={{ fontWeight: "700" }}
                  onPress={() =>
                    navigation.navigate("UserProfileScreen", {
                      userId: post.likedBy._id,
                    })
                  }
                >
                  {post.likedBy.firstName} {post.likedBy.lastName}{" "}
                </Text>
                {post.likes > 1 ? `and ${post.likes - 1} others` : ""}
              </Text>
            ) : (
              <Text
                style={{
                  color: themeStyle.colors.grayscale.mediumGray,
                  fontSize: 12,
                  marginHorizontal: 10,
                  marginVertical: 5,
                }}
              >
                {post.likes} likes
              </Text>
            )}
          </View>
          <PostAge />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderColor: themeStyle.colors.grayscale.lightGray,
    marginBottom: 10,
    backgroundColor: themeStyle.colors.grayscale.white,
  },
  postAge: {
    color: themeStyle.colors.grayscale.mediumGray,
    marginHorizontal: 10,
    marginVertical: 5,
    fontSize: 12,
  },
  preview: {
    margin: 20,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderRadius: 10,
  },
  postAuthorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 5,
    borderColor: themeStyle.colors.grayscale.lightGray,
  },
  postAuthorProfilePic: {
    alignSelf: "flex-start",
    width: 50,
    height: 50,
    borderRadius: 50,
    overflow: "hidden",
  },
  postAuthorProfilePicImage: {
    borderRadius: 10,
    alignSelf: "center",
    width: 50,
    height: 50,
  },
  repostedPostContent: {
    borderWidth: 1,
    borderColor: themeStyle.colors.grayscale.lightGray,
    margin: 10,
  },
});

export default React.memo(
  PostCard,
  (prevProps, nextProps) =>
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.post === nextProps.post
);
