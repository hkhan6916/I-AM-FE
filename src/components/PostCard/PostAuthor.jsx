import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Avatar from "../Avatar";
import themeStyle from "../../theme.style";

const PostAuthor = ({ author }) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.postAuthorContainer]}>
      <Avatar
        navigation={navigation}
        userId={author._id}
        size={50}
        avatarUrl={author.profileGifUrl || author.profileImageUrl}
        hasBorder={!!author.profileGifUrl}
        profileGifHeaders={author.profileGifHeaders}
        profileImageHeaders={author.profileImageHeaders}
        flipProfileVideo={author.flipProfileVideo}
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
          {author.username}
        </Text>
        <Text
          style={{
            maxWidth: 200,
            color: themeStyle.colors.grayscale.lowest,
          }}
          numberOfLines={1}
        >
          {author.firstName} {author.lastName}
        </Text>
        {author.jobTitle && (
          <Text
            numberOfLines={1}
            style={{
              color: themeStyle.colors.grayscale.low,
              maxWidth: 200,
            }}
          >
            {author.jobTitle}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  postAuthorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 5,
    borderColor: themeStyle.colors.grayscale.low,
  },
});

export default React.memo(PostAuthor);
