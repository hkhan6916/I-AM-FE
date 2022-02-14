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
import ContentLoader from "../../../components/ContentLoader";
import themeStyle from "../../../theme.style";
import CommentReplyCard from "../../../components/CommentReplyCard";

const CommentRepliesScreen = (props) => {
  const { comment } = props.route.params;

  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState({
    lastName: comment.lastName,
    firstName: comment.firstName,
    commentId: comment._id,
    replyingToType: "comment",
  });
  const [allCommentsLoaded, setAllCommentsLoaded] = useState(false);
  const [newReply, setNewReply] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [scrollStarted, setScrollStarted] = useState(false);

  const navigation = useNavigation();
  const textInputRef = useRef();

  const getCommentReplies = async (refresh = false, onScroll = false) => {
    if (onScroll && !scrollStarted) return;
    let isCancelled = false;
    if (!isCancelled) {
      if (!allCommentsLoaded) {
        setScrollStarted(false);
        setLoadingMore(!refresh);
        const { response, success } = await apiCall(
          "GET",
          `/posts/comments/replies/${comment._id}/${comments.length}`
        );
        setLoadingMore(false);
        if (success) {
          if (refresh) {
            setAllCommentsLoaded(false);
            setComments(response);
          }
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

  const replyToUser = async ({
    commentId,
    firstName,
    lastName,
    replyingToType,
  }) => {
    if (firstName && lastName && comment._id && replyingToType) {
      if (replyingToType === "reply") {
        textInputRef.current.focus();
        setReplyingTo({
          lastName,
          firstName,
          commentId,
          replyingToType,
        });
        return;
      }

      textInputRef.current.focus();
      setReplyingTo({
        lastName,
        firstName,
        commentId,
        replyingToType,
      });
    }
  };
  const handleReplyToReply = async ({ commentId, firstName, lastName }) => {
    await replyToUser({
      commentId,
      firstName,
      lastName,
      replyingToType: "reply",
    });
  };
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getCommentReplies(true);
    setRefreshing(false);
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <CommentReplyCard handleReplyToReply={handleReplyToReply} reply={item} />
    ),
    []
  );

  const postComment = async (commentBody) => {
    const { response, success } = await apiCall(
      "POST",
      "/posts/comments/replies/add",
      {
        commentId: replyingTo ? replyingTo.commentId : comment._id,
        body: commentBody,
      }
    );
    if (success) {
      response.age = { minutes: 1 };
      const newReply = {
        belongsToUser: true,
        ...response,
      };
      setComments([newReply, ...comments]);
    }
    return success;
  };

  const keyExtractor = useCallback((item) => item._id, []);

  useEffect(() => {
    (async () => {
      await getCommentReplies();
    })();
    return async () => {
      (await getCommentReplies()).cancel();
    };
  }, [navigation]);
  if (comments.length) {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
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
                  color={themeStyle.colors.grayscale.lightGray}
                />
              ) : null}
            </View>
          )}
        />
        <CommentTextInput
          ref={textInputRef}
          submitAction={postComment}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
        />
      </SafeAreaView>
    );
  }
  return <View />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  commentsContainer: {
    flexGrow: 1,
  },
});

export default React.memo(
  CommentRepliesScreen,
  (prev, next) => prev.route.params === next.route.params
);
