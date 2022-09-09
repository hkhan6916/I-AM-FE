import { useNavigation, useIsFocused } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import apiCall from "../../../helpers/apiCall";
import formatAge from "../../../helpers/formatAge";
import themeStyle from "../../../theme.style";
import Avatar from "../../../components/Avatar";
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import ImageWithCache from "../../../components/ImageWithCache";
import VideoPlayer from "../../../components/VideoPlayer";
import AnimatedLottieView from "lottie-react-native";
import { useDispatch } from "react-redux";
import PostAge from "../../../components/PostAge";
import CardImage from "../../../components/CardImage";
import usePersistedWebParams from "../../../helpers/hooks/usePersistedWebParams";

const PostScreen = (props) => {
  // const { post: initialPost, prevScreen } = props.route.params;

  const routeParamsObj = props.route.params;
  const persistedParams = usePersistedWebParams(routeParamsObj);

  // if route params has values then return it else null
  const params =
    routeParamsObj[Object.keys(routeParamsObj)[0]] !== "[object Object]"
      ? routeParamsObj
      : null;

  const dispatch = useDispatch();

  const [post, setPost] = useState(null);
  const [initialPost, setInitialPost] = useState(null);
  const [bodyCollapsed, setBodyCollapsed] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);

  const handleUnMute = (state) => {
    dispatch({ type: "SET_GLOBAL_UNMUTE_VIDEOS", payload: state });

    // setFeed((prevFeed) => {
    //   return prevFeed.map((post) => ({ ...post, unMute: state }));
    // });
  };

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
  const lottieRef = useRef(null);

  const onTextLayout = (e) => {
    setIsCollapsible(e.nativeEvent.lines.length >= 3);
  };

  const getAdditionalPostData = async () => {
    if (initialPost) {
      console.log("heyyeyey");
      const { success, response } = await apiCall(
        "POST",
        `/posts/${initialPost?._id}/additionaldata`
      );
      if (success) {
        setPost({
          ...post,
          liked: response.liked,
          likes: response.likes,
          numberOfComments: response.numberOfComments,
        });
      }
    }
  };

  const handleReaction = async () => {
    if (post.liked) {
      const newPost = { ...post, liked: false, likes: post.likes - 1 };
      setPost(newPost);
      const { success } = await apiCall(
        "GET",
        `/posts/like/remove/${post._id}`
      );
      console.log(success);
      if (!success) {
        setPost(initialPost);
        return;
      }
      dispatch({ type: "SET_UPDATED_POST", payload: newPost });
    } else {
      const newPost = { ...post, liked: true, likes: post.likes + 1 };

      setPost(newPost);
      const { success } = await apiCall("GET", `/posts/like/add/${post._id}`);
      console.log(success);
      if (!success) {
        setPost(initialPost);
        return;
      }
      dispatch({ type: "SET_UPDATED_POST", payload: newPost });
    }
    // lottieRef?.current?.play(15, 1000);
  };

  useEffect(() => {
    const { post: initial } = params || persistedParams;
    if (!initialPost) {
      setPost(initial);
      setInitialPost(initial);
    }
    navigation.addListener("focus", async () => {
      (async () => {
        await getAdditionalPostData();
      })();
    });
    return () => {
      navigation.removeListener("focus");
    };
  }, [params, persistedParams, initialPost]);
  if (post) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View
            style={[
              Platform.OS === "web" && { maxWidth: 900, alignSelf: "center" },
            ]}
          >
            <View>
              {post.postAuthor && (
                <View style={[styles.postAuthorContainer]}>
                  <Avatar
                    navigation={navigation}
                    userId={post.postAuthor._id}
                    size={50}
                    avatarUrl={
                      post.postAuthor.profileGifUrl ||
                      post.postAuthor.profileImageUrl
                    }
                    hasBorder={!!post.postAuthor.profileGifUrl}
                    profileGifHeaders={post.postAuthor.profileGifHeaders}
                    profileImageHeaders={post.postAuthor.profileImageHeaders}
                    flipProfileVideo={post.postAuthor?.flipProfileVideo}
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
            </View>
            <TouchableOpacity
              onPress={() =>
                !post.private && navigation.navigate("MediaScreen", { post })
              }
              underlayColor={themeStyle.colors.grayscale.high}
              delayPressIn={150}
              disabled={!!post.gif}
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
                      shouldPlay={isFocused}
                      mediaIsSelfie={post.mediaIsSelfie}
                      url={post.mediaUrl}
                      thumbnailUrl={post.thumbnailUrl}
                      thumbnailHeaders={post.thumbnailHeaders}
                      isUploading={post.ready === false}
                      isCancelled={post.cancelled}
                      screenHeight={screenHeight}
                      screenWidth={screenWidth}
                      height={post.height}
                      width={post.width}
                      setUnMuteVideos={handleUnMute} // TODO: test this
                    />
                  </View>
                ) : post.mediaType === "image" ? (
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <CardImage
                      isFull
                      mediaHeaders={post.mediaHeaders}
                      mediaUrl={post.mediaUrl}
                      screenWidth={screenWidth}
                      screenHeight={screenHeight}
                      height={post.height}
                      width={post.width}
                    />
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
            {post.body ? (
              <View
                style={{
                  margin: 10,
                }}
              >
                <Text
                  onTextLayout={onTextLayout}
                  numberOfLines={!bodyCollapsed ? 15 : null}
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
                        width: 48,
                        height: 48,
                        justifyContent: "center",
                        alignItems: "flex-start",
                      }}
                    >
                      {post.liked ? (
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <MaterialIcons
                            name={"thumb-up"}
                            size={20}
                            color={themeStyle.colors.secondary.default}
                          />
                        </View>
                      ) : (
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <MaterialCommunityIcons
                            name={"thumb-up-outline"}
                            size={20}
                            color={themeStyle.colors.grayscale.lowest}
                          />
                        </View>
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
                      width: 48,
                      height: 48,
                      justifyContent: "center",
                      alignItems: "flex-start",
                      marginHorizontal: 10,
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
                    width: 48,
                    height: 48,
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
                  width: "100%",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  height: 48,
                  alignItems: "center",
                }}
              >
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
                {post.numberOfComments ? (
                  <TouchableOpacity
                    style={{
                      height: 48,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() =>
                      navigation.navigate("CommentsScreen", {
                        postId: post._id,
                      })
                    }
                  >
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.lower,
                        fontSize: 12,
                        marginHorizontal: 10,
                        fontWeight: "700",
                      }}
                    >
                      View {post.numberOfComments}{" "}
                      {post.numberOfComments > 1 ? "comments" : "comment"}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <PostAge age={post.age} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  return <View />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postAuthorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 5,
    marginBottom: 10,
    marginTop: 10,
    borderColor: themeStyle.colors.grayscale.low,
  },
});

export default PostScreen;
