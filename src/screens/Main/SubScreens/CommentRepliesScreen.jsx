import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import PostCommentCard from "../../../components/PostCommentCard";
import apiCall from "../../../helpers/apiCall";
import CommentTextInput from "../../../components/CommentTextInput";
import themeStyle from "../../../theme.style";
import CommentReplyCard from "../../../components/CommentReplyCard";
import CommentOptionsModal from "../../../components/CommentOptionsModal";

const CommentRepliesScreen = (props) => {
  const { comment: initialComment } = props.route.params;

  const [replies, setReplies] = useState([]);
  const [comment, setComment] = useState(initialComment);
  // just a set of reply IDs so we don't render newly fetched replys if they've just been added by the user
  const [newRepliesIds, setNewRepliesIds] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [allRepliessLoaded, setAllRepliesLoaded] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [scrollStarted, setScrollStarted] = useState(false);
  const [showOptionsForComment, setShowOptionsForComment] = useState(null);
  const [error, setError] = useState("");
  const navigation = useNavigation();
  const textInputRef = useRef();

  const getCommentReplies = async (refresh = false) => {
    let isCancelled = false;
    if (!isCancelled) {
      if (!allRepliessLoaded) {
        setScrollStarted(false);
        setLoadingMore(!refresh);
        const { response, success } = await apiCall(
          "GET",
          `/posts/comments/replies/${comment._id}/${replies.length}`
        );
        setLoadingMore(false);
        if (success) {
          if (refresh) {
            setAllRepliesLoaded(false);
            setReplies(response);
            return;
          }
          if (!response.length) {
            setAllRepliesLoaded(true);
          } else {
            setReplies([...replies, ...response]);
          }
        }
      }
    }
    return {
      cancel() {
        isCancelled = true;
      },
    };
  };

  const reportComment = async (reasonIndex) => {
    setLoading(true);
    const { success } = await apiCall("POST", "/posts/comment/report", {
      commentId: showOptionsForComment._id,
      reason: reasonIndex,
    });
    setLoading(false);
    if (!success) {
      setError("An error occurred.");
    } else {
      setShowOptionsForComment(null);
    }
  };

  const updateComment = async (body) => {
    if (showOptionsForComment) {
      setLoading(true);
      const { success } = await apiCall("POST", "/posts/comments/update", {
        commentId: showOptionsForComment?._id,
        body,
      });
      setLoading(false);
      if (success) {
        if (showOptionsForComment?._id === comment._id) {
          setComment({ ...comment, body });
        }
        const newReplies = replies.map((reply) => {
          if (reply._id === showOptionsForComment?._id) {
            return {
              ...showOptionsForComment,
              body,
              _id: reply._id,
              edited: true,
              updated: true,
              customKey: `${reply._id}-${body.replace(" ", "-")}`,
            };
          }
          return reply;
        });
        setReplies(newReplies);
        setShowOptionsForComment(null);
      } else {
        setError("An error occurred.");
      }
    }
  };

  // passed into reply cards. To be called when replying to a reply.
  const handleReplyToReply = async ({ commentId, firstName, lastName }) => {
    textInputRef.current.focus();
    setReplyingTo({
      lastName,
      firstName,
      commentId,
      replyingToType: "reply",
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getCommentReplies(true);
    setRefreshing(false);
  }, []);

  const deleteComment = async () => {
    setLoading(true);
    const { success } = await apiCall(
      "DELETE",
      `/posts/comments/remove/${showOptionsForComment?._id}`
    );
    setLoading(false);
    if (success) {
      const newReplies = replies.map((reply) => {
        if (reply._id === showOptionsForComment?._id) {
          return {
            ...reply,
            deleted: true,
            customKey: `${reply._id}-deleted}`,
          };
        }
        return reply;
      });
      setReplies(newReplies);
      setShowOptionsForComment(null);
    }
  };

  const postComment = async (commentBody) => {
    // spinner to be added in the text input when this is loading
    const { response, success } = await apiCall(
      "POST",
      "/posts/comments/replies/add",
      {
        commentId: replyingTo ? replyingTo.commentId : comment._id,
        body: commentBody,
      }
    );
    if (success) {
      setNewRepliesIds([...newRepliesIds, response._id]);
      const newReply = {
        ...response,
        age: { minutes: 1 },
        replyingToObj:
          replyingTo?.replyingToType === "reply" ? replyingTo : null,
        belongsToUser: true,
        _id: response._id,
        new: true,
        customKey: `${response._id}-new`,
      };
      setReplies([newReply, ...replies]);
    }
    return success;
  };

  const renderItem = useCallback(
    ({ item }) =>
      // we don't want to render a duplicate of a newly added reply, so we check if it's newly added before render. Below checks if reply is not in the list of new replies the user has just created or if it's a new comment just added then render.
      newRepliesIds.indexOf(item._id) === -1 || item.new ? (
        <CommentReplyCard
          handleReplyToReply={handleReplyToReply}
          reply={item}
          setShowOptionsForComment={setShowOptionsForComment}
        />
      ) : null,
    [newRepliesIds, replies]
  );

  const keyExtractor = useCallback(
    (item) => item.customKey || item._id,
    [replies]
  );

  useEffect(() => {
    (async () => {
      await getCommentReplies();
    })();
    return async () => {
      (await getCommentReplies()).cancel();
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={replies}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
        ListHeaderComponent={() => (
          <PostCommentCard
            isNestedInList={false}
            newReply={null}
            comment={comment}
            setShowOptionsForComment={setShowOptionsForComment}
          />
        )}
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={() => getCommentReplies(false, true)}
        onMomentumScrollBegin={() => !scrollStarted && setScrollStarted(true)}
        onEndReachedThreshold={0.5}
        initialNumToRender={1}
        maxToRenderPerBatch={8}
        windowSize={10}
        ListFooterComponent={() => (
          <View>
            {loadingMore ? (
              <ActivityIndicator
                size={"large"}
                animating
                color={themeStyle.colors.grayscale.low}
              />
            ) : null}
          </View>
        )}
      />
      {showOptionsForComment ? (
        <CommentOptionsModal
          comment={showOptionsForComment}
          updateComment={updateComment}
          deleteComment={deleteComment}
          showOptions={!!showOptionsForComment}
          setShowOptionsForComment={setShowOptionsForComment}
          loading={loading}
          error={error}
          reportComment={reportComment}
        />
      ) : null}
      <CommentTextInput
        ref={textInputRef}
        submitAction={postComment}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  repliesContainer: {
    flexGrow: 1,
  },
});

export default React.memo(
  CommentRepliesScreen,
  (prev, next) => prev.route.params === next.route.params
);
