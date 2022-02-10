import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import themeStyle from "../theme.style";
import Avatar from "./Avatar";
import apiCall from "../helpers/apiCall";
import formatAge from "../helpers/formatAge";
import { Entypo } from "@expo/vector-icons";
import CommentTextInput from "./CommentTextInput";

const CommentReplyCard = ({ reply: initialReply, handleReplyToReply }) => {
  const navigation = useNavigation();
  const [reply, setReply] = useState(initialReply);
  const [deleted, setDeleted] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [error, setError] = useState("");

  const { width: screenWidth } = Dimensions.get("window");

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

  const deleteReply = async () => {
    const { success } = await apiCall(
      "DELETE",
      `/posts/comments/remove/${reply._id}`
    );
    if (success) {
      setDeleted(true);
    }
  };

  const updateReply = async (body) => {
    const { success } = await apiCall("POST", "/posts/comments/update", {
      commentId: reply._id,
      body,
    });
    if (success) {
      const newComment = { ...reply, body, edited: true };
      setReply(newComment);
      setUpdated(true);
    } else {
      setError("An error occurred.");
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
  if (!deleted) {
    return (
      <View style={styles.replyContainer}>
        <Modal visible={showOptions} transparent>
          <TouchableWithoutFeedback
            onPress={() => {
              setShowOptions(false);
              setIsEditing(false);
            }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "flex-end",
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              <TouchableWithoutFeedback>
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    backgroundColor: themeStyle.colors.grayscale.white,
                    borderWidth: 1,
                    borderColor: themeStyle.colors.grayscale.lightGray,
                    padding: 5,
                  }}
                >
                  {!reply.belongsToUser ? (
                    <View style={{ marginVertical: 10 }}>
                      <TouchableOpacity onPress={() => setIsEditing(true)}>
                        <Text
                          style={{
                            color: themeStyle.colors.secondary.default,
                            marginHorizontal: 10,
                            textAlign: "center",
                          }}
                        >
                          Report Comment
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                  {reply.belongsToUser && !isEditing ? (
                    <View>
                      <View style={{ marginVertical: 10 }}>
                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                          <Text
                            style={{
                              color: themeStyle.colors.secondary.default,
                              marginHorizontal: 10,
                              textAlign: "center",
                            }}
                          >
                            Edit
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ marginVertical: 10 }}>
                        <TouchableOpacity onPress={() => deleteReply()}>
                          <Text
                            style={{
                              color: themeStyle.colors.error.default,
                              marginHorizontal: 10,
                              textAlign: "center",
                            }}
                          >
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : isEditing ? (
                    <View
                      style={{
                        marginVertical: 40,
                        height: 200,
                        width: screenWidth / 1.2,
                        justifyContent: "center",
                      }}
                    >
                      {updated ? (
                        <Text
                          style={{
                            alignSelf: "flex-end",
                            fontSize: 12,
                            color: themeStyle.colors.grayscale.mediumGray,
                          }}
                        >
                          Comment updated
                        </Text>
                      ) : null}
                      {error ? (
                        <Text
                          style={{
                            alignSelf: "flex-end",
                            fontSize: 12,
                            color: themeStyle.colors.grayscale.mediumGray,
                          }}
                        >
                          {error}
                        </Text>
                      ) : null}
                      <CommentTextInput
                        submitAction={updateReply}
                        isFullWidth={false}
                        initialCommentBody={reply.body}
                        hasBorderRadius
                      />
                      <TouchableOpacity
                        style={{ alignSelf: "flex-end", marginVertical: 5 }}
                        onPress={() => setIsEditing(false)}
                      >
                        <Text
                          style={{
                            color: themeStyle.colors.grayscale.mediumGray,
                          }}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
                  color: themeStyle.colors.grayscale.lightGray,
                }}
              >
                (edited)
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={{ marginRight: 20 }}
            onPress={() => setShowOptions(!showOptions)}
          >
            <Entypo name="dots-three-vertical" size={16} color="black" />
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
                  color: themeStyle.colors.grayscale.mediumGray,
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
                      : themeStyle.colors.grayscale.mediumGray
                  }
                />
              </TouchableOpacity>
            ) : null}

            {reply.likes > 0 ? (
              <Text
                style={{
                  color: themeStyle.colors.grayscale.black,
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
            {reply.belongsToUser ? (
              <TouchableOpacity onPress={() => deleteReply()}>
                <Text
                  style={{
                    color: themeStyle.colors.error.default,
                    marginHorizontal: 10,
                  }}
                >
                  delete
                </Text>
              </TouchableOpacity>
            ) : null}
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
    color: themeStyle.colors.grayscale.mediumGray,
    marginHorizontal: 10,
    marginVertical: 5,
    fontSize: 12,
  },
});
export default React.memo(CommentReplyCard);
