import React, { useState } from "react";
import { View, TouchableOpacity, Text, Dimensions } from "react-native";
import themeStyle from "../theme.style";
import Avatar from "./Avatar";
import ImageWithCache from "./ImageWithCache";
import { Feather } from "@expo/vector-icons";
import { StackActions, useNavigation } from "@react-navigation/native";

const SearchFeedItem = ({ post, visible }) => {
  const [error, setError] = useState(false);
  const { width: screenWidth } = Dimensions.get("window");
  const imageHeight = screenWidth <= 340 ? screenWidth / 2 : screenWidth / 3;
  const navigation = useNavigation();

  const handleNavigation = () => {
    const pushScreen = StackActions.push("PostScreen", { post });

    navigation.dispatch(pushScreen);
  };
  if (!post || !post?.postAuthor?.profileGifUrl) return null;
  return (
    <View
      style={{
        backgroundColor: themeStyle.colors.grayscale.cards,
        borderBottomColor: themeStyle.colors.grayscale.cardsOuter,
        borderBottomWidth: 3,
      }}
    >
      <TouchableOpacity onPress={() => handleNavigation()}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            // backgroundColor: visible
            //   ? themeStyle.colors.grayscale.highest
            //   : themeStyle.colors.grayscale.highest,
            width: "100%",
            opacity: visible ? 1 : 0,
          }}
        >
          <ImageWithCache
            resizeMode={"cover"}
            mediaUrl={post.thumbnailUrl || post.mediaUrl}
            mediaHeaders={post.thumbnailHeaders || post.mediaHeaders}
            removeBorderRadius
            hideSpinner
            onError={() => setError(true)}
            style={{
              width: imageHeight,
              height: imageHeight,
              opacity: visible ? 1 : 0,
            }}
          />
          <View style={{ flexDirection: "row", flex: 1 }}>
            <Text
              style={{
                flex: 1,
                color: themeStyle.colors.grayscale.lowest,
                marginLeft: 10,
              }}
            >
              {post.body}
            </Text>
            <View
              style={{
                opacity: 0.5,
                flexDirection: "column",
                justifyContent: "space-between",
                marginRight: 10,
                paddingVertical: 5,
              }}
            >
              {post.mediaType === "video" ? (
                <View
                  style={{
                    zIndex: 1,
                  }}
                >
                  <Feather
                    name="play"
                    size={20}
                    color={themeStyle.colors.grayscale.lowest}
                  />
                </View>
              ) : (
                <View />
              )}
              <Avatar
                style={{ borderWidth: 1 }}
                size={20}
                avatarUrl={post.postAuthor.profileGifUrl}
                profileGifHeaders={post.postAuthor.profileGifHeaders}
                flipProfileVideo={post.postAuthor.flipProfileVideo}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
export default React.memo(SearchFeedItem);
