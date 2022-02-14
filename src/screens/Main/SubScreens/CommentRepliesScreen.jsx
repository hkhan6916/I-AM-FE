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

  const [replies, setReplies] = useState([]);
  // just a set of reply IDs so we don't render newly fetched replys if they've just been added by the user
  const [newRepliesIds, setNewRepliesIds] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [allRepliessLoaded, setAllRepliesLoaded] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [scrollStarted, setScrollStarted] = useState(false);

  const navigation = useNavigation();
  const textInputRef = useRef();

  const getCommentReplies = async (refresh = false, onScroll = false) => {
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

  const renderItem = useCallback(
    ({ item }) =>
      // we don't want to render a duplicate of a newly added reply, so we check if it's newly added before render. Below checks if reply is not in the list of new replies the user has just created or if it's a new comment just added then render.
      newRepliesIds.indexOf(item._id) === -1 || item.new ? (
        <CommentReplyCard
          handleReplyToReply={handleReplyToReply}
          reply={item}
        />
      ) : null,
    [newRepliesIds]
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
      console.log({ newRepliesIds, thenewONe: response._id });
      setNewRepliesIds([...newRepliesIds, response._id]);
      const newReply = {
        ...response,
        replyingToObj:
          replyingTo?.replyingToType === "reply" ? replyingTo : null,
        belongsToUser: true,
        _id: response._id,
        new: true,
      };
      setReplies([newReply, ...replies]);
    }
    return success;
  };

  // even though renderitem never double renders newly created replies, the "Encountered two children with the same key" warning still shows so need to append "-new" to any new replies by checking the reply's "new" key so that the same key is never found
  const keyExtractor = useCallback(
    (item) => (item.new ? `${item._id}-new` : item._id),
    []
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
