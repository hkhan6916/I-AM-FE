import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  RefreshControl,
  FlatList,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import apiCall from "../../../helpers/apiCall";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import themeStyle from "../../../theme.style";
import PostCard from "../../../components/PostCard";
import ProfileInfo from "../../../components/ProfileInfo";
import ContentLoader from "../../../components/ContentLoader";
import PostOptionsModal from "../../../components/PostOptionsModal";
import { useSelector } from "react-redux";
import makeCancelable from "../../../helpers/makeCancelable";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";

const UserProfileScreen = (props) => {
  const { userId } = props.route.params;
  const [user, setUser] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [accepted, setAccepted] = useState(false);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(null);
  const [error, setError] = useState("");

  const userData = useSelector((state) => state.userData);

  const isFocused = useIsFocused();

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const navigation = useNavigation();

  const flatlistRef = useRef(null);
  const ViewTypes = {
    HEADER: 0,
    STANDARD: 1,
  };

  const handleNavigation = (post) => {
    navigation.navigate("MediaScreen", { post });
  };

  const reportPost = async (reasonIndex) => {
    setLoading(true);
    const { success } = await apiCall("POST", "/posts/report", {
      postId: showPostOptions?._id,
      reason: reasonIndex,
    });
    setLoading(false);
    if (!success) {
      setError("An error occurred.");
    } else {
      setShowPostOptions(null);
    }
  };

  const editPost = () => {
    setShowPostOptions(null);
    navigation.navigate("EditPostScreen", { postId: showPostOptions?._id });
  };
  const deletePost = async () => {
    const { success } = await apiCall(
      "DELETE",
      `/posts/remove/${showPostOptions?._id}`
    );
    if (success) {
      const newPosts = userPosts.map((post) => {
        if (post._id === showPostOptions?._id) {
          return {
            ...post,
            deleted: true,
            customKey: `${post._id}-deleted}`,
          };
        }
        return post;
      });
      setUserPosts(newPosts);
      setShowPostOptions(null);
    }
  };

  const sendFriendRequest = async () => {
    if (user.private) {
      const userRequestSent = { ...user, requestSent: true };

      setUser(userRequestSent);

      const { success, error } = await apiCall(
        "GET",
        `/user/friend/request/send/${userId}`
      );

      if (!success || error === "CONNECTION_FAILED") {
        const userRequestRemoved = { ...user, requestSent: false };
        setUser(userRequestRemoved);
      }
    } else {
      const userRequestSent = { ...user, isFriend: true };

      setUser(userRequestSent);

      const { success, error } = await apiCall(
        "GET",
        `/user/friend/request/send/${userId}`
      );

      if (!success || error === "CONNECTION_FAILED") {
        const userRequestRemoved = { ...user, isFriend: false };
        setUser(userRequestRemoved);
      }
    }
  };

  const recallFriendRequest = async () => {
    const userRequestSent = { ...user, requestSent: false };

    setUser(userRequestSent);
    const { success, error } = await apiCall(
      "GET",
      `/user/friend/request/recall/${userId}`
    );
    if (!success || error === "CONNECTION_FAILED") {
      const userRequestRemoved = { ...user, requestSent: true };
      setUser(userRequestRemoved);
    }
  };

  const acceptFriendRequest = async () => {
    const userIsFriend = { ...user, isFriend: true };

    setUser(userIsFriend);

    const { success, error } = await apiCall(
      "GET",
      `/user/friend/request/accept/${userId}`
    );

    if (!success || error === "CONNECTION_FAILED") {
      const userIsNotFriend = { ...user, isFriend: false };

      setUser(userIsNotFriend);
    }
    setAccepted(true);
  };

  const rejectFriendRequest = async () => {
    const userRequestRejected = { ...user, requestReceived: false };

    setUser(userRequestRejected);
    const { success, error } = await apiCall(
      "GET",
      `/user/friend/request/reject/${userId}`
    );
    if (!success || error === "CONNECTION_FAILED") {
      const userRequestRemoved = { ...user, requestReceived: true };
      setUser(userRequestRemoved);
    }
  };

  const removeConnection = async () => {
    const userIsNotFriend = {
      ...user,
      isFriend: false,
      requestReceived: false,
      requestSent: false,
    };

    setUser(userIsNotFriend);

    const { success, error } = await apiCall(
      "GET",
      `/user/friend/remove/${userId}`
    );
    if (success && user.private) {
      setUserPosts([]);
    }
    if (!success || error === "CONNECTION_FAILED") {
      const userIsFriend = { ...user, isFriend: true, requestReceived: false };

      setUser(userIsFriend);
    }
  };

  const getUserPosts = async () => {
    if (!allPostsLoaded) {
      setLoading(true);
      const { success, response } = await apiCall(
        "GET",
        `/user/${userId}/posts/${userPosts.length}`,
        null
      );
      setLoading(false);
      if (success) {
        if (!response.length && userPosts.length) {
          setAllPostsLoaded(true);
        } else {
          setUserPosts([...userPosts, ...response]);
        }
      } else if (userPosts.length) {
        setAllPostsLoaded(true);
      }
    }
  };
  const onViewableItemsChanged = ({ viewableItems }) => {
    viewableItems.forEach((item) => {
      if (item.isViewable) {
        setVisibleItems([item.item._id]);
      }
    });
  };
  const viewabilityConfig = {
    waitForInteraction: true,
    viewAreaCoveragePercentThreshold: 50,
    minimumViewTime: 1500,
  };

  const viewabilityConfigCallbackPairs = useRef([
    { onViewableItemsChanged, viewabilityConfig },
  ]);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeData();
    setRefreshing(false);
  }, []);

  const triggerOptionsModal = (post) => {
    setError("");
    setShowPostOptions(post);
  };

  const initializeData = makeCancelable(
    apiCall("GET", `/user/${userId}`, null)
  );

  const handleReaction = async (post) => {
    const oldUserposts = userPosts;

    if (post.liked) {
      setUserPosts((prev) => {
        return prev.map((p) => {
          if (p._id === post._id) {
            return { ...p, liked: false };
          }
          return p;
        });
      });
      const { success, message } = await apiCall(
        "GET",
        `/posts/like/remove/${post._id}`
      );
      if (!success) {
        setUserPosts(oldUserposts);
      }
      return;
    }
    setUserPosts((prev) => {
      return prev.map((p) => {
        if (p._id === post._id) {
          return { ...p, liked: true };
        }
        return p;
      });
    });
    const { success, message } = await apiCall(
      "GET",
      `/posts/like/add/${post._id}`
    );
    if (!success) {
      setUserPosts(oldUserposts);
    }
    console.log(message);
  };

  const rowRenderer = useCallback(
    (type, item, index, extendedState) => {
      //We have only one view type so not checks are needed here
      if (type === ViewTypes.HEADER && isFocused) {
        return (
          <ProfileInfo
            user={user}
            setUser={setUser}
            setUserPosts={setUserPosts}
            recallFriendRequest={recallFriendRequest}
            acceptFriendRequest={acceptFriendRequest}
            rejectFriendRequest={rejectFriendRequest}
            sendFriendRequest={sendFriendRequest}
            removeConnection={removeConnection}
            canAdd={userData.state?.profileVideoUrl}
          />
        );
      }
      if (!item.deleted) {
        return (
          <PostCard
            post={item}
            setShowPostOptions={triggerOptionsModal}
            screenHeight={screenHeight}
            screenWidth={screenWidth}
            handleNavigation={handleNavigation}
            isVisible={false}
            // unmount={!isFocused}
            disableVideo
            handleReaction={handleReaction}
          />
        );
      }
    },
    [isFocused, user, userData, userPosts]
  );

  let dataProvider = new DataProvider(
    (r1, r2) => {
      return r1._id !== r2._id || r1.liked !== r2.liked;
    }
    // (index) => `${userPosts[index]?._id}`
  ).cloneWithRows([{}, ...userPosts]);

  const layoutProvider = useRef(
    new LayoutProvider(
      // (index) => index,
      (index) => {
        if (index === 0) {
          return ViewTypes.HEADER;
        } else {
          return ViewTypes.STANDARD;
        }
      },
      (_, dim) => {
        dim.width = screenWidth;
        dim.height = 600;
      }
    )
  ).current;

  function renderHeader() {
    if (isFocused) {
      return (
        <ProfileInfo
          user={user}
          setUser={setUser}
          setUserPosts={setUserPosts}
          recallFriendRequest={recallFriendRequest}
          acceptFriendRequest={acceptFriendRequest}
          rejectFriendRequest={rejectFriendRequest}
          sendFriendRequest={sendFriendRequest}
          removeConnection={removeConnection}
          canAdd={userData.state?.profileVideoUrl}
        />
      );
    }
    return null;
  }

  const keyExtractor = useCallback(
    (item) => item?.customKey || item?._id,
    [userPosts]
  );

  useEffect(() => {
    initializeData.promise.then(async ({ success, response }) => {
      if (success) {
        setUser(response.otherUser);
        navigation.setOptions({
          title: response.otherUser.isSameUser
            ? "Me"
            : `${response.otherUser.firstName} ${response.otherUser.lastName}`,
        });
        if (
          !response.otherUser?.private ||
          (response.otherUser?.private && response.otherUser.isFriend) ||
          response.otherUser.isSameUser
        ) {
          await getUserPosts();
        }
      }
    });

    return () => {
      setUser({});
      setUserPosts([]);
      initializeData.cancel();
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (accepted) {
        await getUserPosts();
      }
    })();
    return () => {};
  }, [accepted]);

  if (user && user._id) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <RecyclerListView
          style={{ minHeight: 1, minWidth: 1 }}
          dataProvider={dataProvider}
          layoutProvider={layoutProvider}
          onEndReached={() => getUserPosts()}
          onEndReachedThreshold={0.5}
          rowRenderer={rowRenderer}
          extendedState={{ userData }}
          renderAheadOffset={screenHeight}
          forceNonDeterministicRendering
          scrollViewProps={{
            removeClippedSubviews: true,
            refreshControl: (
              <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
            ),
            // decelerationRate: 0.9,
          }}

          // ListHeaderComponent={renderHeaderComponent}
        />

        <PostOptionsModal
          showOptions={!!showPostOptions}
          setShowPostOptions={setShowPostOptions}
          reportPost={reportPost}
          deletePost={deletePost}
          editPost={editPost}
          belongsToUser={showPostOptions?.belongsToUser}
          error={error}
        />
      </SafeAreaView>
    );
  }
  return (
    <View>
      <View style={{ width: screenWidth, height: screenWidth }}>
        <ContentLoader active isProfileVideo />
      </View>
      <ContentLoader active listSize={1} />
      <View style={{ width: screenWidth, height: screenWidth }}>
        <ContentLoader active isProfileVideo />
      </View>
      <ContentLoader active listSize={1} />
    </View>
  );
};

export default UserProfileScreen;
