import React from "react";
import { Text, View, TouchableOpacity } from "react-native";

import themeStyle from "../../theme.style";
import PostAge from "../PostAge";
const Info = ({ post, navigation }) => {
  return (
    <View>
      <View
        style={{
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <View
          style={{
            height: 30,
            justifyContent: "center",
          }}
        >
          {post.likedBy ? (
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                fontSize: 12,
                marginHorizontal: 10,
                marginVertical: 5,
                flex: 1,
              }}
            >
              Liked by{" "}
              <Text
                style={{
                  fontWeight: "700",
                  color: themeStyle.colors.grayscale.lowest,
                }}
                onPress={() =>
                  navigation.navigate("UserProfileScreen", {
                    userId: post.likedBy._id,
                  })
                }
              >
                {post.likedBy.firstName} {post.likedBy.lastName}{" "}
              </Text>
              {post.likes > 1 ? `and ${post.likes - 1} others` : ""}
            </Text>
          ) : (
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                fontSize: 12,
                marginHorizontal: 10,
                marginVertical: 5,
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              {post.likes} likes
            </Text>
          )}
        </View>
        {post.numberOfComments ? (
          <TouchableOpacity
            style={{ height: 30, justifyContent: "center" }}
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
  );
};

export default React.memo(
  Info,
  (prevProps, nextProps) => prevProps.post === nextProps.post
);
