import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import themeStyle from "../theme.style";
import Avatar from "./Avatar";
import apiCall from "../helpers/apiCall";
import CommentReplyCard from "./CommentReplyCard";
import formatAge from "../helpers/formatAge";
import { Entypo } from "@expo/vector-icons";
import CommentTextInput from "./CommentTextInput";

const PostCommentCard = ({
  comment: initialComment,
  replyToUser,
  newReply,
}) => {
  const navigation = useNavigation();
  const [comment, setComment] = useState(initialComment);
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { width: screenWidth } = Dimensions.get("window");

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

  const getCommentReplies = async (refresh = false) => {
    setShowReplies(true);
    setLoading(true);
    const { response, success } = await apiCall(
      "GET",
      `/posts/comments/replies/${comment._id}/${replies.length}`
    );
    setLoading(false);
    if (success) {
      if (refresh) {
        setReplies([response]);
        return;
      }
      setReplies([...replies, ...response]);
    }
  };

  const deleteComment = async () => {
    const { success } = await apiCall(
      "DELETE",
      `/posts/comments/remove/${comment._id}`
    );
    if (success) {
      setDeleted(true);
      setReplies([]);
    }
  };

  const updateComment = async (body) => {
    const { success } = await apiCall("POST", "/posts/comments/update", {
      commentId: comment._id,
      body, // todo set comment as edited in backend
    });
    if (success) {
      const newComment = { ...comment, body, edited: true };
      setComment(newComment);
      setUpdated(true);
    } else {
      setError("An error occurred.");
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

  const handleReplyToReply = async ({ commentId, firstName, lastName }) => {
    await replyToUser({
      commentId,
      firstName,
      lastName,
      replyingToType: "reply",
    });
  };

  const handleReplyToComment = async () => {
    setShowReplies(true);
    await replyToUser({
      commentId: comment._id,
      firstName: comment.commentAuthor?.firstName,
      lastName: comment.commentAuthor?.lastName,
      replyingToType: "comment",
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getCommentReplies(true);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (newReply) {
      setReplies([...replies, newReply]);
    }
  }, [newReply]);

  if (!deleted) {
    return (
      <View style={styles.container}>
        <FlatList
          data={replies}
          renderItem={({ item }) => (
            <CommentReplyCard
              handleReplyToReply={handleReplyToReply}
              key={item._id}
              reply={item}
            />
          )}
          keyExtractor={(item, index) => `${item._id}-${index}`}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
          ListHeaderComponent={() => (
            <View>
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
                        {!comment.belongsToUser ? (
                          <View style={{ marginVertical: 10 }}>
                            <TouchableOpacity
                              onPress={() => setIsEditing(true)}
                            >
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
                        {comment.belongsToUser && !isEditing ? (
                          <View>
                            <View style={{ marginVertical: 10 }}>
                              <TouchableOpacity
                                onPress={() => setIsEditing(true)}
                              >
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
                              <TouchableOpacity onPress={() => deleteComment()}>
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
                                Reply updated
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
                              submitAction={updateComment}
                              isFullWidth={false}
                              initialCommentBody={comment.body}
                              hasBorderRadius
                            />
                            <TouchableOpacity
                              style={{
                                alignSelf: "flex-end",
                                marginVertical: 5,
                              }}
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
                  style={{ alignSelf: "center", marginRight: 20 }}
                  onPress={() => setShowOptions(!showOptions)}
                >
                  <Entypo name="dots-three-vertical" size={16} color="black" />
                </TouchableOpacity>
              </View>
              <View style={styles.commentBodyContainer}>
                <Text>{comment.body}</Text>
              </View>
              <View style={styles.actionsContainer}>
                <View style={styles.actions}>
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
              {comment.replyCount && !replies.length ? (
                <View style={{ flex: 1, alignItems: "center", padding: 10 }}>
                  <TouchableOpacity onPress={() => getCommentReplies()}>
                    <Text
                      style={{ color: themeStyle.colors.grayscale.darkGray }}
                    >
                      View {comment.replyCount}{" "}
                      {comment.replyCount > 1 ? "replies" : "reply"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {replies.length ? (
                <View style={{ flex: 1, alignItems: "center", padding: 10 }}>
                  <TouchableOpacity
                    onPress={() => setShowReplies(!showReplies)}
                  >
                    <Text
                      style={{ color: themeStyle.colors.grayscale.darkGray }}
                    >
                      {showReplies ? "Hide replies" : "Show replies"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          )}
          ListFooterComponent={() => (
            <ActivityIndicator
              size="large"
              animating={loading}
              color={themeStyle.colors.grayscale.lightGray}
            />
          )}
          contentContainerStyle={{ flexGrow: 1 }}
          onEndReached={() => getCommentReplies()}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          // windowSize={5}
        />
        {replies.length &&
        comment.replyCount > replies.length &&
        showReplies ? (
          <View style={{ flex: 1, alignItems: "center", padding: 10 }}>
            <TouchableOpacity onPress={() => getCommentReplies()}>
              <Text style={{ color: themeStyle.colors.grayscale.darkGray }}>
                Load more replies
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
