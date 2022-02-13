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
import CommentOptionsModal from "./CommentOptionsModal";

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
  const [reported, setReported] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const { width: screenWidth } = Dimensions.get("window");

  const reportOptions = [
    "It's spam",
    "It does not belong on Magnet",
    "It's inappropriate",
  ];

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
    let isCancelled = false;
    if (!isCancelled) {
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
    }
    return {
      cancel() {
        isCancelled = true;
      },
    };
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

  // const updateComment = async (body) => {
  //   const { success } = await apiCall("POST", "/posts/comments/update", {
  //     commentId: comment._id,
  //     body,
  //   });
  //   if (success) {
  //     const newComment = { ...comment, body, edited: true };
  //     setComment(newComment);
  //     setUpdated(true);
  //   } else {
  //     setError("An error occurred.");
  //   }
  // };

  const reportComment = async (reasonIndex) => {
    const { success } = await apiCall("POST", "/posts/comment/report", {
      commentId: comment._id,
      reason: reasonIndex,
    });
    if (success) {
      setReported(true);
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

  const updateComment = async (body) => {
    setLoading(true);
    const { success } = await apiCall("POST", "/posts/comments/update", {
      commentId: comment._id,
      body,
    });
    setLoading(false);
    if (success) {
      setShowOptions(false);
      const newComment = { ...comment, body: body, edited: true };
      setComment(newComment);
      setUpdated(true);
    } else {
      setError("An error occurred.");
    }
  };

  useEffect(() => {
    if (newReply) {
      setReplies([...replies, newReply]);
    }
    return async () => (await getCommentReplies()).cancel();
  }, [newReply]);

  if (!deleted) {
    return (
      <View style={styles.container}>
        <FlatList
          data={replies}
          renderItem={({ item }) => {
            if (showReplies) {
              return (
                <CommentReplyCard
                  handleReplyToReply={handleReplyToReply}
                  key={item._id}
                  reply={item}
                />
              );
            }
          }}
          keyExtractor={(item, index) => `${item._id}-${index}`}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
          ListHeaderComponent={() => (
            <View>
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
            <View>
              <CommentOptionsModal
                comment={comment}
                updateComment={updateComment}
                setDeleted={setDeleted}
                showOptions={showOptions}
                setShowOptions={setShowOptions}
              />
              {loading ? (
                <ActivityIndicator
                  size="large"
                  animating={loading}
                  color={themeStyle.colors.grayscale.lightGray}
                />
              ) : null}
            </View>
          )}
          contentContainerStyle={{ flexGrow: 1 }}
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
