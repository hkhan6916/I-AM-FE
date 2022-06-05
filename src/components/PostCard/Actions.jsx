import React, { useRef } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import {
  MaterialCommunityIcons,
  FontAwesome,
  Ionicons,
} from "@expo/vector-icons";
import themeStyle from "../../theme.style";
import AnimatedLottieView from "lottie-react-native";
import PostAge from "../PostAge";
const Actions = ({ post, handleReaction, navigation }) => {
  const lottieRef = useRef(null);

  return (
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
              onPress={() => {
                if (!post.liked) {
                  lottieRef?.current?.play(15, 1000);
                }
                handleReaction(post);
              }}
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
                  source={require("../../../assets/lotties/like.json")}
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
      <View
        style={{
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        {post.likedBy ? (
          <Text
            style={{
              color: themeStyle.colors.grayscale.lower,
              fontSize: 12,
              marginHorizontal: 10,
              marginVertical: 5,
            }}
          >
            Liked by{" "}
            <Text
              style={{
                fontWeight: "700",
                color: themeStyle.colors.grayscale.lower,
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
              color: themeStyle.colors.grayscale.lower,
              fontSize: 12,
              marginHorizontal: 10,
              marginVertical: 5,
            }}
          >
            {post.likes} likes
          </Text>
        )}
      </View>
      <PostAge age={post.age} />
    </View>
  );
};

export default React.memo(
  Actions,
  (prevProps, nextProps) => prevProps.post === nextProps.post
);
