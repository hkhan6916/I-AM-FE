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

const CommentsScreen = (props) => {
  const { postId } = props.route.params;

  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [allCommentsLoaded, setAllCommentsLoaded] = useState(false);
  const [newReply, setNewReply] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [scrollStarted, setScrollStarted] = useState(false);

  const navigation = useNavigation();
  const textInputRef = useRef();

  const getComments = async (refresh = false, onScroll = false) => {
    if (onScroll && !scrollStarted) return;
    let isCancelled = false;
    if (!isCancelled) {
      if (!allCommentsLoaded) {
        setScrollStarted(false);
        setLoadingMore(!refresh);
        const { response, success } = await apiCall(
          "GET",
          `/posts/comments/${postId}/${comments.length}`
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

  const postComment = async (commentBody) => {
    if (replyingTo && replyingTo.commentId) {
      const { response, success } = await apiCall(
        "POST",
        "/posts/comments/replies/add",
        {
          commentId: replyingTo.commentId,
          body: commentBody,
        }
      );
      if (success) {
        response.age = { minutes: 1 };
        setNewReply({
          replyingToObj:
            replyingTo.replyingToType === "reply" ? replyingTo : null,
          replyingToId: replyingTo.commentId,
          belongsToUser: true,
          ...response,
        });
      }
      return success;
    }
    const { response, success } = await apiCall("POST", "/posts/comments/add", {
      postId,
      body: commentBody,
    });
    if (success) {
      const tweakedResponse = {
        ...response,
        _id: `${response._id}-new`,
        age: { minutes: 1 },
      };
      const updatedComments = [tweakedResponse, ...comments];

      setComments(updatedComments);
    }
    return success;
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getComments(true);
    setRefreshing(false);
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <PostCommentCard
        newReply={newReply?.parentCommentId === item._id ? newReply : null}
        replyToUser={replyToUser}
        key={item._id}
        comment={item}
      />
    ),
    []
  );

  const keyExtractor = useCallback((item) => item._id, []);

  useEffect(() => {
    let isMounted = true;
    navigation.addListener("focus", async () => {
      setLoading(true);
      await apiCall("GET", `/posts/comments/${postId}/${comments.length}`).then(
        ({ success, response }) => {
          if (isMounted) {
            setLoading(false);
            if (success) {
              if (!response.length) {
                setAllCommentsLoaded(true);
              } else {
                setComments([...comments, ...response]);
              }
            }
          }
        }
      );
    });
    return async () => {
      isMounted = false;
      (await getComments()).cancel();
    };
  }, [navigation]);

  if (loading) {
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
      <FlatList
        data={comments}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={() => getComments(false, true)}
        onMomentumScrollBegin={() => !scrollStarted && setScrollStarted(true)}
        onEndReachedThreshold={0.5}
        initialNumToRender={1}
        maxToRenderPerBatch={8}
        windowSize={10}
        // ListFooterComponent={() => (
        //   <View>
        //     {loadingMore ? (
        //       <ActivityIndicator
        //         size={"large"}
        //         animating
        //         color={themeStyle.colors.grayscale.lightGray}
        //       />
        //     ) : null}
        //   </View>
        // )}
      />
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
  commentsContainer: {
    flexGrow: 1,
  },
});

export default React.memo(
  CommentsScreen,
  (prev, next) => prev.route.params === next.route.params
);
