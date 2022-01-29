import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Avatar from "./Avatar";
import themeStyle from "../theme.style";
import ImageWithCache from "./ImageWithCache";
import { Feather } from "@expo/vector-icons";

const RepostCard = ({ postContent, isPreview }) => {
  const [bodyCollapsed, setBodyCollapsed] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);

  const navigation = useNavigation();
  const onTextLayout = (e) => {
    setIsCollapsible(e.nativeEvent.lines.length >= 3);
  };

  return (
    <TouchableOpacity
      style={styles.repostedPostContent}
      onPress={() => navigation.navigate("PostsScreen", { post: postContent })}
      underlayColor={themeStyle.colors.grayscale.mediumGray}
    >
      <View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            padding: 7,
            borderBottomWidth: isPreview ? 0.5 : 0,
            borderColor: themeStyle.colors.grayscale.lightGray,
          }}
        >
          <Avatar
            navigation={navigation}
            userId={postContent.postAuthor._id}
            size={50}
            avatarUrl={postContent.postAuthor.profileGifUrl}
            profileGifHeaders={postContent.postAuthor.profileGifHeaders}
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
              {postContent.postAuthor.username}
            </Text>
            <Text style={{ maxWidth: 200 }} numberOfLines={1}>
              {postContent.postAuthor.firstName}{" "}
              {postContent.postAuthor.lastName}
            </Text>
          </View>
        </View>
        {postContent.mediaType === "video" ? (
          <View
            style={{
              flex: 1,
              flexDirection: "column",
            }}
          >
            {/* <VideoPlayer
              shouldPlay={false}
              mediaOrientation={postContent.mediaOrientation}
              mediaIsSelfie={postContent.mediaIsSelfie}
              url={postContent.mediaUrl}
              mediaHeaders={postContent.mediaHeaders}
            /> */}
            <ImageWithCache
              removeBorderRadius
              mediaHeaders={postContent.mediaHeaders}
              mediaOrientation={postContent.mediaOrientation}
              mediaIsSelfie={postContent.mediaIsSelfie}
              resizeMode="cover"
              mediaUrl={postContent.mediaUrl}
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
                color={themeStyle.colors.grayscale.white}
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
              mediaOrientation={postContent.mediaOrientation}
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
            }}
          >
            <Text
              onTextLayout={onTextLayout}
              numberOfLines={!bodyCollapsed ? 3 : null}
              style={{ textAlign: "left" }}
            >
              {postContent.body}
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  repostedPostContent: {
    borderWidth: 1,
    borderColor: themeStyle.colors.grayscale.lightGray,
    margin: 10,
  },
});

export default React.memo(
  RepostCard,
  (prevProps, nextProps) => prevProps.postContent === nextProps.postContent
);