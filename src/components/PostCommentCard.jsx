import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import themeStyle from "../theme.style";
import Avatar from "./Avatar";
import apiCall from "../helpers/apiCall";
import formatAge from "../helpers/formatAge";
import { Entypo } from "@expo/vector-icons";

const PostCommentCard = ({
  comment: initialComment,
  isNestedInList = true,
  setShowOptionsForComment,
  deleted,
}) => {
  const navigation = useNavigation();
  const [comment, setComment] = useState(initialComment);

  const handleReaction = async () => {
    if (comment.liked) {
      const newComment = { ...comment, liked: false };
      newComment.likes -= 1;
      setComment(newComment);
      const { success } = await apiCall(
        "GET",
        `/posts/comment/like/remove/${comment._id}`
      );
      if (!success) {
        setComment(initialComment);
      }
    } else {
      const newComment = { ...comment, liked: true };
      newComment.likes += 1;
      setComment(newComment);
      const { success } = await apiCall(
        "GET",
        `/posts/comment/like/add/${comment._id}`
      );
      if (!success) {
        setComment(initialComment);
      }
    }
  };

  const CommentAge = () => {
    const { age } = comment;
    const ageObject = formatAge(age);

    return (
      <Text style={styles.commentAge}>
        {ageObject.age} {ageObject.unit} ago
      </Text>
    );
  };

  const handleReplyToComment = async () => {
    navigation.navigate("CommentRepliesScreen", { comment: comment });
  };

  if (!comment.deleted) {
    return (
      <View style={styles.container}>
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <View style={styles.headerContainer}>
            <Avatar
              hasBorder
              userId={comment.userId}
              navigation={navigation}
              avatarUrl={comment.commentAuthor.profileGifUrl}
              profileGifHeaders={comment.commentAuthor.profileGifHeaders}
              size={40}
            />
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("UserProfileScreen", {
                  userId: comment.userId,
                })
              }
            >
              <Text style={styles.commentAuthorName} numberOfLines={1}>
                {comment.commentAuthor?.firstName}{" "}
                {comment.commentAuthor?.lastName}
              </Text>
            </TouchableOpacity>
            {comment.edited ? (
              <Text
                style={{
                  fontSize: 12,
                  marginHorizontal: 10,
                  color: themeStyle.colors.grayscale.lightGray,
                }}
              >
                (edited)
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={{
              alignSelf: "center",
              width: 48,
              height: 48,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setShowOptionsForComment(comment)}
          >
            <Entypo name="dots-three-vertical" size={16} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.commentBodyContainer}>
          <Text>{comment.body}</Text>
        </View>
        <View style={styles.actionsContainer}>
          <View style={styles.actions}>
            {isNestedInList ? (
              <TouchableOpacity
                onPress={() => handleReplyToComment()}
                style={styles.replyTrigger}
              >
                <Text
                  style={{
                    color: themeStyle.colors.grayscale.mediumGray,
                    fontWeight: "700",
                  }}
                >
                  Reply
                </Text>
              </TouchableOpacity>
            ) : null}
            <View style={{ flexDirection: "row" }}>
              {!comment.belongsToUser ? (
                <TouchableOpacity
                  onPress={() => handleReaction()}
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginHorizontal: 5,
                  }}
                >
                  <MaterialCommunityIcons
                    name={comment.liked ? "thumb-up" : "thumb-up-outline"}
                    size={20}
                    color={
                      comment.liked
                        ? themeStyle.colors.secondary.default
                        : themeStyle.colors.grayscale.mediumGray
                    }
                  />
                </TouchableOpacity>
              ) : null}
              {comment.likes > 0 ? (
                <Text
                  style={{
                    color: themeStyle.colors.grayscale.black,
                    marginHorizontal: 10,
                  }}
                >
                  {comment.likes} {comment.likes > 1 ? "likes" : "like"}
                </Text>
              ) : null}
            </View>
          </View>
          <CommentAge />
        </View>
        {comment.replyCount && isNestedInList ? (
          <View style={{ flex: 1, alignItems: "center", padding: 10 }}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CommentRepliesScreen", {
                  comment: comment,
                })
              }
            >
              <Text style={{ color: themeStyle.colors.grayscale.darkGray }}>
                View {comment.replyCount}{" "}
                {comment.replyCount > 1 ? "replies" : "reply"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  }
  return <View />;
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 0.5,
    borderColor: themeStyle.colors.grayscale.mediumGray,
    display: "flex",
    flexDirection: "column",
  },
  replyContainer: {
    marginLeft: 70,
    padding: 20,
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
    flex: 1,
  },
  commentBodyContainer: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  commentAuthorName: {
    maxWidth: 170,
    marginLeft: 10,
    color: themeStyle.colors.primary.default,
    fontWeight: "700",
  },
  actionsContainer: {
    padding: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actions: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  replyTrigger: {
    marginRight: 10,
  },
  likeTrigger: {
    marginRight: 10,
  },
  commentAge: {
    color: themeStyle.colors.grayscale.mediumGray,
    marginHorizontal: 10,
    marginVertical: 5,
    fontSize: 12,
  },
});
export default React.memo(PostCommentCard);
