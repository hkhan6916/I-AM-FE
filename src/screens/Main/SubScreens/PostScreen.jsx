import { useNavigation } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import PostCard from "../../../components/PostCard";
import apiCall from "../../../helpers/apiCall";
import formatAge from "../../../helpers/formatAge";
import themeStyle from "../../../theme.style";
import Avatar from "../../../components/Avatar";
import { Entypo } from "@expo/vector-icons";
import ImageWithCache from "../../../components/ImageWithCache";
import VideoPlayer from "../../../components/VideoPlayer";

const PostScreen = (props) => {
  const { post: initialPost } = props.route.params;
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

  const PostAge = () => {
    const { age } = post;
    const ageObject = formatAge(age);

    return (
      <Text style={styles.postAge}>
        {ageObject.age} {ageObject.unit} ago
      </Text>
    );
  };
  if (post) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View>
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
          </View>
          <TouchableOpacity
            onPress={() =>
              !post.private && navigation.navigate("MediaScreen", { post })
            }
            underlayColor={themeStyle.colors.grayscale.high}
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
                    shouldPlay={false}
                    mediaOrientation={post.mediaOrientation}
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
                padding: 5,
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
                      color: themeStyle.colors.grayscale.higher,
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
    padding: 5,
    borderColor: themeStyle.colors.grayscale.low,
  },
});

export default PostScreen;
