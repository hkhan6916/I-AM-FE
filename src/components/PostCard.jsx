import React, { useRef, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  MaterialCommunityIcons,
  FontAwesome,
  Ionicons,
  Entypo,
} from "@expo/vector-icons";
import VideoPlayer from "./VideoPlayer";
import Avatar from "./Avatar";
import themeStyle from "../theme.style";
import apiCall from "../helpers/apiCall";
import ImageWithCache from "./ImageWithCache";
import RepostCard from "./RepostCard";
import AnimatedLottieView from "lottie-react-native";
import PostAge from "./PostAge";
import AdCard from "./AdCard";

const PostCard = ({
  post: initialPost,
  hideActions = false,
  isPreview = false,
  isVisible,
  setShowPostOptions,
  deleted,
  adsManager,
  nativeAd,
}) => {
  const [post, setPost] = useState(initialPost);
  const [bodyCollapsed, setBodyCollapsed] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);

  const navigation = useNavigation();

  const lottieRef = useRef(null);

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
    lottieRef?.current?.play(15, 1000);
  };
  console.log("rendering");
  if (!deleted) {
    return (
      <View>
        {/* {console.log(post._id)}
        <Text style={{ color: "white" }}>{post._id}</Text> */}
        {adsManager ? (
          <AdCard
            adsManager={adsManager}
            // onAdLoaded={(ad) => setReadyAdsCount(readyAdsCount + 1)}
          />
        ) : null}
        <View style={[styles.container, isPreview && styles.preview]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
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
                    style={{
                      fontWeight: "700",
                      maxWidth: 200,
                      color: themeStyle.colors.grayscale.lowest,
                    }}
                  >
                    {post.postAuthor.username}
                  </Text>
                  <Text
                    style={{
                      maxWidth: 200,
                      color: themeStyle.colors.grayscale.lowest,
                    }}
                    numberOfLines={1}
                  >
                    {post.postAuthor.firstName} {post.postAuthor.lastName}
                  </Text>
                  {post.postAuthor.jobTitle && (
                    <Text
                      numberOfLines={1}
                      style={{
                        color: themeStyle.colors.grayscale.high,
                        maxWidth: 200,
                      }}
                    >
                      {post.postAuthor.jobTitle}
                    </Text>
                  )}
                </View>
              </View>
            )}
            <TouchableOpacity
              style={{
                alignSelf: "flex-end",
                width: 48,
                height: 48,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => setShowPostOptions(post)}
            >
              <Entypo
                name="dots-three-vertical"
                size={16}
                color={themeStyle.colors.grayscale.lowest}
              />
            </TouchableOpacity>
          </View>
          {post.repostPostId ? (
            <View>
              <RepostCard
                postContent={post.repostPostObj}
                isPreview={isPreview}
              />
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
                    style={{
                      textAlign: "left",
                      color: themeStyle.colors.grayscale.lowest,
                    }}
                  >
                    {post.body}
                  </Text>
                  {isCollapsible && !bodyCollapsed ? (
                    <TouchableOpacity onPress={() => setBodyCollapsed(true)}>
                      <Text
                        style={{
                          color: themeStyle.colors.grayscale.low,
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
                onPress={() =>
                  !post.private &&
                  !post.gif &&
                  navigation.navigate("MediaScreen", { post })
                }
                underlayColor={themeStyle.colors.grayscale.high}
                delayPressIn={150}
              >
                <View>
                  {post.gif ? (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "column",
                      }}
                    >
                      <Image
                        resizeMode={"contain"}
                        style={{
                          aspectRatio: 1 / 1,
                          width: "100%",
                          height: "100%",
                        }}
                        source={{ uri: post.gif }}
                      />
                    </View>
                  ) : post.mediaType === "video" ? (
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
                        mediaIsSelfie={post.mediaIsSelfie}
                        url={post.mediaUrl}
                        thumbnailUrl={post.thumbnailUrl}
                        thumbnailHeaders={post.thumbnailHeaders}
                        isUploading={post.ready === false}
                        isCancelled={post.cancelled}
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
                    style={{
                      textAlign: "left",
                      color: themeStyle.colors.grayscale.lowest,
                    }}
                  >
                    {post.body}
                  </Text>
                  {isCollapsible && !bodyCollapsed ? (
                    <TouchableOpacity onPress={() => setBodyCollapsed(true)}>
                      <Text
                        style={{
                          color: themeStyle.colors.grayscale.low,
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
                      {post.liked ? (
                        <AnimatedLottieView
                          ref={lottieRef}
                          autoPlay={false}
                          loop={false}
                          progress={1}
                          speed={1}
                          source={require("../../assets/lotties/like.json")}
                          style={{
                            width: 40,
                            height: 40,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name={"thumb-up-outline"}
                          size={20}
                          color={themeStyle.colors.grayscale.lowest}
                        />
                      )}
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
                      color={themeStyle.colors.grayscale.lowest}
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ShareScreen", {
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
                    color={themeStyle.colors.grayscale.lowest}
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
                      color: themeStyle.colors.grayscale.lower,
                      fontSize: 12,
                      marginHorizontal: 10,
                      marginVertical: 5,
                    }}
                  >
                    Liked by{" "}
                    <Text
                      style={{
                        fontWeight: "700",
                        color: themeStyle.colors.grayscale.lower,
                      }}
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
                      color: themeStyle.colors.grayscale.lower,
                      fontSize: 12,
                      marginHorizontal: 10,
                      marginVertical: 5,
                    }}
                  >
                    {post.likes} likes
                  </Text>
                )}
              </View>
              <PostAge age={post.age} />
            </View>
          )}
        </View>
      </View>
    );
  }
  return <View />;
};

const styles = StyleSheet.create({
  container: {
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderColor: themeStyle.colors.grayscale.low,
    borderBottomColor: themeStyle.colors.grayscale.higher,
    borderBottomWidth: 2,
    backgroundColor: themeStyle.colors.grayscale.highest,
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
    borderColor: themeStyle.colors.grayscale.low,
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
    borderColor: themeStyle.colors.grayscale.low,
    margin: 10,
  },
});

export default React.memo(
  PostCard,
  (prevProps, nextProps) =>
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.post === nextProps.post &&
    prevProps.deleted === nextProps.deleted
);
