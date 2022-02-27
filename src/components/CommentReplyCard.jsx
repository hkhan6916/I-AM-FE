import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import themeStyle from "../theme.style";
import Avatar from "./Avatar";
import apiCall from "../helpers/apiCall";
import formatAge from "../helpers/formatAge";
import { Entypo } from "@expo/vector-icons";

const CommentReplyCard = ({
  reply: initialReply,
  handleReplyToReply,
  setShowOptionsForComment,
}) => {
  const navigation = useNavigation();
  const [reply, setReply] = useState(initialReply);

  const handleReaction = async () => {
    if (reply.liked) {
      const newComment = { ...reply, liked: false };
      newComment.likes -= 1;
      setReply(newComment);
      const { success } = await apiCall(
        "GET",
        `/posts/comment/like/remove/${reply._id}`
      );
      if (!success) {
        setReply(initialReply);
      }
    } else {
      const newComment = { ...reply, liked: true };
      newComment.likes += 1;
      setReply(newComment);
      const { success } = await apiCall(
        "GET",
        `/posts/comment/like/add/${reply._id}`
      );
      if (!success) {
        setReply(initialReply);
      }
    }
  };

  const CommentAge = () => {
    const { age } = reply;
    const ageObject = formatAge(age);

    return (
      <Text style={styles.commentAge}>
        {ageObject.age} {ageObject.unit} ago
      </Text>
    );
  };
  if (!reply.deleted) {
    return (
      <View style={styles.replyContainer}>
        <View
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <View style={styles.profileInfoContainer}>
            <Avatar
              hasBorder
              userId={reply.userId}
              navigation={navigation}
              size={35}
              avatarUrl={reply.replyAuthor.profileGifUrl}
              profileGifHeaders={reply.replyAuthor.profileGifHeaders}
            />
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("UserProfileScreen", {
                  userId: reply.userId,
                })
              }
            >
              <Text style={styles.replyAuthorName} numberOfLines={1}>
                {reply.replyAuthor?.firstName} {reply.replyAuthor?.lastName}
              </Text>
            </TouchableOpacity>
            {reply.edited ? (
              <Text
                style={{
                  fontSize: 12,
                  marginHorizontal: 10,
                  color: themeStyle.colors.grayscale.low,
                }}
              >
                (edited)
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={{ marginRight: 20 }}
            onPress={() => setShowOptionsForComment(reply)}
          >
            <Entypo
              name="dots-three-vertical"
              size={16}
              color={themeStyle.colors.grayscale.lowest}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.replyBodyContainer}>
          {reply.replyingToObj && reply.replyingToId ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("UserProfileScreen", {
                  userId: reply.replyingToId,
                })
              }
            >
              <Text
                style={{
                  color: themeStyle.colors.secondary.default,
                  fontWeight: "700",
                  justifyContent: "center",
                }}
              >
                {reply.replyingToObj.firstName} {reply.replyingToObj.lastName}{" "}
              </Text>
            </TouchableOpacity>
          ) : null}
          <Text>{reply.body}</Text>
        </View>
        <View style={styles.actionsContainer}>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() =>
                handleReplyToReply({
                  firstName: reply.replyAuthor.firstName,
                  lastName: reply.replyAuthor.lastName,
                  commentId: reply._id,
                })
              }
              style={styles.replyTrigger}
            >
              <Text
                style={{
                  color: themeStyle.colors.grayscale.low,
                  fontWeight: "700",
                }}
              >
                Reply
              </Text>
            </TouchableOpacity>
            {!reply.belongsToUser ? (
              <TouchableOpacity
                onPress={() => handleReaction()}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginHorizontal: 5,
                }}
              >
                <MaterialCommunityIcons
                  name={reply.liked ? "thumb-up" : "thumb-up-outline"}
                  size={20}
                  color={
                    reply.liked
                      ? themeStyle.colors.secondary.default
                      : themeStyle.colors.grayscale.low
                  }
                />
              </TouchableOpacity>
            ) : null}

            {reply.likes > 0 ? (
              <Text
                style={{
                  color: themeStyle.colors.grayscale.lowest,
                  marginLeft: 10,
                }}
              >
                {reply.likes} {reply.likes > 1 ? "likes" : "like"}
              </Text>
            ) : null}
          </View>
          <View
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <CommentAge />
          </View>
        </View>
      </View>
    );
  }
  return <View />;
};
const styles = StyleSheet.create({
  replyContainer: {
    marginLeft: 70,
    marginVertical: 20,
  },
  profileInfoContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
  },
  replyBodyContainer: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  replyAuthorName: {
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
    color: themeStyle.colors.grayscale.low,
    marginHorizontal: 10,
    marginVertical: 5,
    fontSize: 12,
  },
});
export default React.memo(CommentReplyCard);
