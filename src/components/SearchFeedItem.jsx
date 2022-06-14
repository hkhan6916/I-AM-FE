import React from "react";
import { View, TouchableOpacity, Text, Image } from "react-native";
import themeStyle from "../theme.style";
import Avatar from "./Avatar";
import { Feather } from "@expo/vector-icons";
import { StackActions, useNavigation } from "@react-navigation/native";
import FastImage from "react-native-fast-image";

const SearchFeedItem = ({ post }) => {
  const navigation = useNavigation();

  const handleNavigation = () => {
    const pushScreen = StackActions.push("PostScreen", { post });
    navigation.dispatch(pushScreen);
  };

  // if (!post || !post?.postAuthor?.profileGifUrl) return null;
  return (
    <TouchableOpacity onPress={() => handleNavigation()}>
      <View
        style={{
          backgroundColor: themeStyle.colors.grayscale.cards,
          borderBottomColor: themeStyle.colors.grayscale.cardsOuter,
          borderBottomWidth: 3,
          height: 150,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            width: "100%",
            opacity: 1,
          }}
        >
          <Image
            source={{
              uri: post.thumbnailUrl || post.mediaUrl,
              headers: post.thumbnailHeaders || post.mediaHeaders,
            }}
            style={{
              width: 146,
              height: 146,
              opacity: 1,
              backgroundColor: themeStyle.colors.grayscale.high,
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
                // need this as view here, not null
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
      </View>
    </TouchableOpacity>
  );
};
export default React.memo(SearchFeedItem);
