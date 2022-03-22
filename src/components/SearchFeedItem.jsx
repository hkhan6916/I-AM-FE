import React, { useState } from "react";
import { View, TouchableOpacity, Text, Dimensions } from "react-native";
import themeStyle from "../theme.style";
import Avatar from "./Avatar";
import ImageWithCache from "./ImageWithCache";
import { Feather } from "@expo/vector-icons";

const SearchFeedItem = ({ post }) => {
  const { width: screenWidth } = Dimensions.get("window");
  const imageHeight = screenWidth <= 340 ? screenWidth / 2 : screenWidth / 3;

  if (!post) return null;
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
      }}
    >
      {post.mediaType === "video" ? (
        <View
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            zIndex: 1,
          }}
        >
          <Feather name="play" size={20} color={themeStyle.colors.white} />
        </View>
      ) : null}
      <ImageWithCache
        resizeMode={"cover"}
        mediaUrl={post.thumbnailUrl || post.mediaUrl}
        mediaHeaders={post.thumbnailHeaders || post.mediaHeaders}
        removeBorderRadius
        style={{
          width: imageHeight,
          height: imageHeight,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 3,
          right: 3,
          opacity: 0.5,
          flexDirection: "row",
        }}
      >
        <Avatar
          style={{ borderWidth: 1 }}
          size={20}
          avatarUrl={post.postAuthor.profileGifUrl}
          profileGifHeaders={post.postAuthor.profileGifHeaders}
        />
      </View>
    </View>
  );
};
export default React.memo(SearchFeedItem);
