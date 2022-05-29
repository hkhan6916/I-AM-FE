import { useNavigation } from "@react-navigation/native";
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
} from "@expo/vector-icons";
import ImageWithCache from "../../../components/ImageWithCache";
import VideoPlayer from "../../../components/VideoPlayer";
import AnimatedLottieView from "lottie-react-native";
import { useDispatch } from "react-redux";
import PostAge from "../../../components/PostAge";
import FastImage from "react-native-fast-image";

const PostScreen = (props) => {
  const { post: initialPost, prevScreen } = props.route.params;

  const dispatch = useDispatch();

  const [post, setPost] = useState(initialPost);
  const [bodyCollapsed, setBodyCollapsed] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);

  const navigation = useNavigation();
  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
  const lottieRef = useRef(null);

  const handleGoBack = () => {
    if (prevScreen) {
      navigation.navigate(prevScreen, {
        postToUpdate: post,
      });
    } else {
      navigation.goBack();
    }
  };
  console.log(post);

  const onTextLayout = (e) => {
    setIsCollapsible(e.nativeEvent.lines.length >= 3);
  };

  const getAdditionalPostData = async () => {
    const { success, response } = await apiCall(
      "POST",
      `/posts/${post?._id}/additionaldata`
    );
    if (success) {
      setPost({
        ...post,
        liked: response.liked,
        likes: response.likes,
      });
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
      if (!success) {
        setPost(initialPost);
        return;
      }
      dispatch({ type: "SET_UPDATED_POST", payload: newPost });
    } else {
      const newPost = { ...post, liked: true, likes: post.likes + 1 };

      setPost(newPost);
      const { success } = await apiCall("GET", `/posts/like/add/${post._id}`);
      if (!success) {
        setPost(initialPost);
        return;
      }
      dispatch({ type: "SET_UPDATED_POST", payload: newPost });
    }
    lottieRef?.current?.play(15, 1000);
  };

  useEffect(() => {
    (async () => await getAdditionalPostData())();
  }, []);

  if (post) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => handleGoBack()}
            style={{
              marginVertical: 10,
              marginHorizontal: 15,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="arrow-back"
              size={32}
              color={themeStyle.colors.grayscale.low}
            />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ marginVertical: 20 }}>
          <View>
            {post.postAuthor && (
              <View style={[styles.postAuthorContainer]}>
                <Avatar
                  navigation={navigation}
                  userId={post.postAuthor._id}
                  size={50}
                  avatarUrl={post.postAuthor.profileGifUrl}
                  profileGifHeaders={post.postAuthor.profileGifHeaders}
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
                  <FastImage
                    resizeMode={"contain"}
                    style={{
                      aspectRatio: 1 / 1,
                      width: "100%",
                      height: "100%",
                    }}
                    source={{ uri: post.gif, cache: "web" }}
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
                    shouldPlay={true}
                    mediaIsSelfie={post.mediaIsSelfie}
                    url={post.mediaUrl}
                    thumbnailUrl={post.thumbnailUrl}
                    thumbnailHeaders={post.thumbnailHeaders}
                    isUploading={post.ready === false}
                    isCancelled={post.cancelled}
                    showToggle
                    isMuted
                    screenHeight={screenHeight}
                    screenWidth={screenWidth}
                  />
                </View>
              ) : post.mediaType === "image" ? (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "column",
                    maxHeight: screenHeight / 1.5 || 500,
                    alignItems: "center",
                  }}
                >
                  <ImageWithCache
                    removeBorderRadius
                    mediaHeaders={post.mediaHeaders}
                    mediaIsSelfie={post.mediaIsSelfie}
                    resizeMode="contain"
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
                marginHorizontal: 10,
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
                        source={require("../../../../assets/lotties/like.json")}
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
            <PostAge age={post.age} />
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
    marginBottom: 20,
    borderColor: themeStyle.colors.grayscale.low,
  },
});

export default PostScreen;
