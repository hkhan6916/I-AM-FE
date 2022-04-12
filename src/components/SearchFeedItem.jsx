import React, { useState } from "react";
import { View, TouchableOpacity, Text, Dimensions } from "react-native";
import themeStyle from "../theme.style";
import Avatar from "./Avatar";
import ImageWithCache from "./ImageWithCache";
import { Feather } from "@expo/vector-icons";
import { StackActions, useNavigation } from "@react-navigation/native";

const SearchFeedItem = ({ post, visible }) => {
  const { width: screenWidth } = Dimensions.get("window");
  const imageHeight = screenWidth <= 340 ? screenWidth / 2 : screenWidth / 3;
  const navigation = useNavigation();

  const handleNavigation = () => {
    const pushScreen = StackActions.push("PostScreen", { post });

    navigation.dispatch(pushScreen);
  };
  if (!post) return null;
  return (
    <TouchableOpacity onPress={() => handleNavigation()}>
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          // backgroundColor: visible
          //   ? themeStyle.colors.grayscale.highest
          //   : themeStyle.colors.grayscale.highest,
          opacity: visible ? 1 : 0,
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
          hideSpinner
          style={{
            width: imageHeight,
            height: imageHeight,
            borderWidth: 2,
            opacity: visible ? 1 : 0,
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
    </TouchableOpacity>
  );
};
export default React.memo(SearchFeedItem);
