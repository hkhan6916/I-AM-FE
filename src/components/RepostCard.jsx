import React from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { StackActions, useNavigation } from "@react-navigation/native";
import Avatar from "./Avatar";
import themeStyle from "../theme.style";
import ImageWithCache from "./ImageWithCache";
import { Feather } from "@expo/vector-icons";
import FastImage from "react-native-fast-image";

const RepostCard = ({ postContent, isPreview }) => {
  const navigation = useNavigation();

  const handleNavigation = () => {
    const pushScreen = StackActions.push("PostScreen", { post: postContent });

    navigation.dispatch(pushScreen);
  };

  if (!postContent) {
    return (
      <View
        style={{
          borderColor: themeStyle.colors.grayscale.low,
          borderWidth: 0.5,
          padding: 20,
          margin: 20,
        }}
      >
        <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
          This post no longer exists.
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.repostedPostContent}
      onPress={() => handleNavigation()}
      underlayColor={themeStyle.colors.grayscale.high}
      disabled={isPreview}
      delayPressIn={200}
    >
      <View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            padding: 7,
            borderBottomWidth: isPreview ? 0.5 : 0,
            borderColor: themeStyle.colors.grayscale.low,
          }}
        >
          <Avatar
            navigation={navigation}
            userId={postContent.postAuthor._id}
            size={50}
            avatarUrl={postContent.postAuthor.profileGifUrl}
            profileGifHeaders={postContent.postAuthor.profileGifHeaders}
            flipProfileVideo={postContent.postAuthor?.flipProfileVideo}
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
              {postContent.postAuthor.username}
            </Text>
            <Text
              style={{ maxWidth: 200, color: themeStyle.colors.grayscale.low }}
              numberOfLines={1}
            >
              {postContent.postAuthor.firstName}{" "}
              {postContent.postAuthor.lastName}
            </Text>
          </View>
        </View>
        {postContent.gif ? (
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
              source={{ uri: postContent.gif, cache: "web" }}
            />
          </View>
        ) : postContent.mediaType === "video" ? (
          <View
            style={{
              flex: 1,
              flexDirection: "column",
            }}
          >
            <ImageWithCache
              removeBorderRadius
              mediaHeaders={postContent.thumbnailHeaders}
              mediaIsSelfie={postContent.mediaIsSelfie}
              resizeMode="cover"
              mediaUrl={postContent.thumbnailUrl}
              aspectRatio={1 / 1}
            />
            <View
              style={{
                position: "absolute",
                top: 10,
                right: 10,
              }}
            >
              <Feather
                name={"play"}
                size={48}
                color={themeStyle.colors.grayscale.lowest}
              />
            </View>
          </View>
        ) : postContent.mediaType === "image" ? (
          <View
            style={{
              flex: 1,
              flexDirection: "column",
            }}
          >
            <ImageWithCache
              removeBorderRadius
              mediaHeaders={postContent.mediaHeaders}
              mediaIsSelfie={postContent.mediaIsSelfie}
              resizeMode="cover"
              mediaUrl={postContent.mediaUrl}
              aspectRatio={1 / 1}
            />
          </View>
        ) : null}
        {postContent.body ? (
          <View
            style={{
              margin: 10,
              maxHeight: 200,
            }}
          >
            <View>
              <Text
                numberOfLines={6}
                style={{
                  textAlign: "left",
                  color: themeStyle.colors.grayscale.lowest,
                }}
              >
                {postContent.body}
              </Text>
            </View>
            <View
              style={{
                position: "absolute",
                bottom: -10,
                width: "100%",
                height: 30,
                opacity: 0.7,
                backgroundColor: themeStyle.colors.grayscale.highest,
              }}
            />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  repostedPostContent: {
    borderWidth: 1,
    borderColor: themeStyle.colors.grayscale.low,
    margin: 10,
  },
});

export default React.memo(
  RepostCard,
  (prevProps, nextProps) => prevProps.postContent === nextProps.postContent
);
