import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import PostCommentCard from "../../../components/PostCommentCard";
import apiCall from "../../../helpers/apiCall";
import CommentTextInput from "../../../components/CommentTextInput";
import ContentLoader from "../../../components/ContentLoader";
import themeStyle from "../../../theme.style";
import CommentOptionsModal from "../../../components/CommentOptionsModal";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";

const CommentsScreen = (props) => {
  const { postId } = props.route.params;

  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  // just a set of comment IDs so we don't render newly fetched comments if they've just been added by the user
  const [newCommentsIds, setNewCommentsIds] = useState([]);
  const [allCommentsLoaded, setAllCommentsLoaded] = useState(false);
  const [newReply, setNewReply] = useState(null);
  const [loading, setLoading] = useState(false);
  const [intialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [scrollStarted, setScrollStarted] = useState(false);
  const [showOptionsForComment, setShowOptionsForComment] = useState(null);
  const [error, setError] = useState("");

  const navigation = useNavigation();
  const textInputRef = useRef();

  const { width: screenWidth } = Dimensions.get("window");

  const getComments = async (onScroll = false) => {
    if (onScroll && !scrollStarted) return;
    let isCancelled = false;
    if (!isCancelled) {
      if (!allCommentsLoaded) {
        setScrollStarted(false);
        setLoadingMore(true);
        const { response, success } = await apiCall(
          "GET",
          `/posts/comments/${postId}/${comments.length}`
        );
        setLoadingMore(false);
        if (success) {
          if (!response.length) {
            setAllCommentsLoaded(true);
          } else {
            setComments([...comments, ...response]);
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

  const handleReaction = async (reply) => {
    if (!reply) return;
    const oldReplies = comments;

    if (reply?.liked) {
      setComments((prev) => {
        return prev.map((p) => {
          if (p?._id === reply?._id) {
            return { ...p, liked: false, likes: (p.likes || 1) - 1 };
          }
          return p;
        });
      });
      const { success } = await apiCall(
        "GET",
        `/posts/comment/like/remove/${reply._id}`
      );
      if (!success) {
        setComments(oldReplies);
      }
      return;
    }

    setComments((prev) => {
      return prev.map((p) => {
        if (p._id === reply._id) {
          return { ...p, liked: true, likes: (p.likes || 0) + 1 };
        }
        return p;
      });
    });
    const { success } = await apiCall(
      "GET",
      `/posts/comment/like/add/${reply._id}`
    );
    if (!success) {
      setComments(oldReplies);
    }
  };

  const deleteComment = async () => {
    setLoading(true);
    const { success } = await apiCall(
      "DELETE",
      `/posts/comments/remove/${showOptionsForComment?._id}`
    );
    setLoading(false);
    if (success) {
      const newComments = comments.map((comment) => {
        if (comment._id === showOptionsForComment?._id) {
          return {
            ...comment,
            deleted: true,
            customKey: `${comment._id}-deleted}`,
          };
        }
        return comment;
      });
      setComments(newComments);
      setShowOptionsForComment(null);
    }
  };

  const postComment = async (commentBody) => {
    // spinner to be added in modal text input while this is loading
    const { response, success } = await apiCall("POST", "/posts/comments/add", {
      postId,
      body: commentBody,
    });
    if (success) {
      setNewCommentsIds([...newCommentsIds, response._id]);
      const tweakedResponse = {
        ...response,
        age: { minutes: 1 },
        new: true,
        customKey: `${response._id}-new`,
      };
      const updatedComments = [tweakedResponse, ...comments];

      setComments(updatedComments);
    }
    return success;
  };

  const reportComment = async (reasonIndex) => {
    setLoading(true);
    const { success } = await apiCall("POST", "/posts/comment/report", {
      commentId: showOptionsForComment?._id,
      reason: reasonIndex,
    });
    setLoading(false);
    if (!success) {
      setError("An error occurred.");
    } else {
      setShowOptionsForComment(null);
    }
  };

  const replyToUser = async ({
    commentId,
    firstName,
    lastName,
    replyingToType,
  }) => {
    if (firstName && lastName && commentId && replyingToType) {
      if (replyingToType === "reply") {
        textInputRef.current.focus();
        setReplyingTo({
          lastName,
          firstName,
          commentId,
          replyingToType,
        });
      }

      if (replyingToType === "comment") {
        textInputRef.current.focus();
        setReplyingTo({
          lastName,
          firstName,
          commentId,
          replyingToType,
        });
      }
    }
  };

  const updateComment = async (body) => {
    setLoading(true);
    if (showOptionsForComment) {
      const { success } = await apiCall("POST", "/posts/comments/update", {
        commentId: showOptionsForComment?._id,
        body,
      });
      setLoading(false);
      if (success) {
        const newComments = comments.map((comment) => {
          if (comment._id === showOptionsForComment?._id) {
            return {
              ...showOptionsForComment,
              body,
              _id: comment._id,
              edited: true,
              updated: true,
              customKey: `${comment._id}-${body.replace(" ", "-")}`,
            };
          }
          return comment;
        });
        setComments(newComments);
        // setUpdated(true);
        setShowOptionsForComment(null);
      } else {
        setError("An error occurred.");
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setNewCommentsIds([]);
    await apiCall("GET", `/posts/comments/${postId}/0`).then(
      ({ success, response }) => {
        console.log(response.length);
        if (success) {
          if (!response.length) {
            setAllCommentsLoaded(true);
          } else {
            setComments([...response]);
          }
        }
      }
    );
    setRefreshing(false);
  };

  const triggerOptionsModal = (post) => {
    setShowOptionsForComment(post);
    setError("");
  };

  const renderItem = useCallback(
    ({ item }) =>
      newCommentsIds.indexOf(item._id) === -1 || item.new ? ( // prevent newly created comments from rendering again since they'll be fetch from the backend as the user scrolls
        <PostCommentCard
          replyToUser={replyToUser}
          key={item._id}
          comment={item}
          setShowOptionsForComment={triggerOptionsModal}
          handleReaction={handleReaction}
        />
      ) : null,
    [newCommentsIds, comments]
  );

  const layoutProvider = useRef(
    new LayoutProvider(
      // (index) => index,
      (index) => 0,
      (_, dim) => {
        dim.width = screenWidth;
        dim.height = 300;
      }
    )
  ).current;

  let dataProvider = new DataProvider((r1, r2) => {
    return (
      r1._id !== r2._id ||
      r1.body !== r2.body ||
      r1.likes !== r2.likes ||
      r1.liked !== r2.liked
    );
  }).cloneWithRows(comments);

  const rowRenderer = useCallback(
    (type, item, i) =>
      // we don't want to render a duplicate of a newly added reply, so we check if it's newly added before render. Below checks if reply is not in the list of new replies the user has just created or if it's a new comment just added then render.
      newCommentsIds.indexOf(item._id) === -1 || item.new ? ( // prevent newly created comments from rendering again since they'll be fetch from the backend as the user scrolls
        <PostCommentCard
          replyToUser={replyToUser}
          key={item._id}
          comment={item}
          setShowOptionsForComment={triggerOptionsModal}
          handleReaction={handleReaction}
        />
      ) : null,
    [newCommentsIds, comments]
  );

  const renderFooter = useCallback(
    () => (
      <View>
        {loadingMore ? (
          <ActivityIndicator
            size={"large"}
            animating
            color={themeStyle.colors.grayscale.low}
          />
        ) : null}
      </View>
    ),
    [loadingMore]
  );

  const keyExtractor = useCallback(
    (item) => item.customKey || item._id,
    [comments, newCommentsIds]
  );

  useEffect(() => {
    (async () => {
      setInitialLoading(true);
      await apiCall("GET", `/posts/comments/${postId}/0`).then(
        ({ success, response }) => {
          setInitialLoading(false);
          if (success) {
            if (!response.length) {
              setAllCommentsLoaded(true);
            } else {
              setComments(response);
            }
          }
        }
      );
    })();
    return async () => {
      (await getComments()).cancel();
    };
  }, []);

  if (intialLoading) {
    return (
      <View>
        <ContentLoader active showAvatar avatarSize={50} />
        <ContentLoader active showAvatar avatarSize={50} />
        <ContentLoader active showAvatar avatarSize={50} />
        <ContentLoader active showAvatar avatarSize={50} />
        <ContentLoader active showAvatar avatarSize={50} />
        <ContentLoader active showAvatar avatarSize={50} />
        <ContentLoader active showAvatar avatarSize={50} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" && "padding"}
        keyboardVerticalOffset={93}
        style={{ flex: 1 }}
      >
        {comments?.length ? (
          <RecyclerListView
            style={{ minHeight: 1, minWidth: 1 }}
            rowRenderer={rowRenderer}
            dataProvider={dataProvider}
            onEndReached={() => getComments(true)}
            layoutProvider={layoutProvider}
            onEndReachedThreshold={0.5}
            forceNonDeterministicRendering
            renderFooter={renderFooter}
            scrollViewProps={{
              onScrollEndDrag: () => {
                Keyboard.dismiss();
              },
              refreshControl: (
                <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
              ),
            }}
          />
        ) : null}

        <View>
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  commentsContainer: {
    flexGrow: 1,
  },
});

export default React.memo(CommentsScreen);
