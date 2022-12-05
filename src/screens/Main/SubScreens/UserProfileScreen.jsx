import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  RefreshControl,
  SafeAreaView,
  Dimensions,
  Platform,
  TouchableOpacity,
  Text,
  Modal,
} from "react-native";
import apiCall from "../../../helpers/apiCall";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import PostCard from "../../../components/PostCard";
import ProfileInfo from "../../../components/ProfileInfo";
import PostOptionsModal from "../../../components/PostOptionsModal";
import { useSelector } from "react-redux";
import makeCancelable from "../../../helpers/makeCancelable";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";
import getWebPersistedUserData from "../../../helpers/getWebPersistedData";
import themeStyle from "../../../theme.style";
import { AntDesign } from "@expo/vector-icons";
import EducationHistoryItem from "../../../components/EducationHistory/EducationHistoryItem";
import JobHistoryItem from "../../../components/JobHistory/JobHistoryItem";
import ProfileLoader from "../../../components/ContentLoader/Profile";
import JobAndEducationHistoryLoader from "../../../components/ContentLoader/JobAndEducationHistory";

const UserProfileScreen = (props) => {
  const { userId } = props.route.params;
  const [user, setUser] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [userJobHistory, setUserJobHistory] = useState(null);
  const [userEducationHistory, setUserEducationHistory] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(null);
  const [error, setError] = useState("");
  const [profileVideoVisible, setProfileVideoVisible] = useState(false);
  const [showJobHistoryModal, setShowJobHistoryModal] = useState(false);
  const [showEducationHistoryModal, setShowEducationHistoryModal] =
    useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const nativeUserData = useSelector((state) => state.userData);

  const userData =
    Platform.OS === "web"
      ? { state: getWebPersistedUserData() }
      : nativeUserData;

  const isFocused = useIsFocused();

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const mobileSpecificListProps =
    Platform.OS !== "web"
      ? {
          renderAheadOffset: screenHeight,
        }
      : {};
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

  const getFullUserJobHistory = async () => {
    setLoadingHistory(true);
    setShowJobHistoryModal(true);
    // if (!userJobHistory) {
    const { success, response } = await apiCall(
      "POST",
      `/user/job-history/fetch/all`,
      { userId }
    );
    if (success) {
      setUserJobHistory(response);
    }
    // }
    setLoadingHistory(false);
  };

  const getFullUserEducationHistory = async () => {
    setLoadingHistory(true);
    setShowEducationHistoryModal(true);
    // if (!userEducationHistory) {
    const { success, response, message } = await apiCall(
      "POST",
      `/user/education-history/fetch/all`,
      { userId }
    );
    console.log({ response, success, message });
    if (success) {
      setUserEducationHistory(response);
    }
    // }
    setLoadingHistory(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const { success, response } = await apiCall("GET", `/user/${userId}`, null);
    if (success) {
      setUser(response.otherUser);
    }
    setRefreshing(false);
  };

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
            return {
              ...p,
              liked: false,
              likes: post.likes ? post.likes - 1 : post.likes,
            };
          }
          return p;
        });
      });
      const { success } = await apiCall(
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
          return {
            ...p,
            liked: true,
            likes: typeof post.likes === "number" ? post.likes + 1 : post.likes,
          };
        }
        return p;
      });
    });
    const { success } = await apiCall("GET", `/posts/like/add/${post._id}`);
    if (!success) {
      setUserPosts(oldUserposts);
    }
  };

  const rowRenderer = useCallback(
    (type, item, index, extendedState) => {
      //We have only one view type so not checks are needed here
      if (type === ViewTypes.HEADER) {
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
              canAdd={
                userData.state?.profileVideoUrl ||
                userData.state?.profileImageUrl
              }
              isVisible={extendedState.profileVideoVisible} // If scrolled to top
              getUserJobHistory={getFullUserJobHistory}
              getUserEducationHistory={getFullUserEducationHistory}
            />
          );
        }
        return (
          <View
            style={{
              height: screenWidth + 150,
              width: screenWidth + 150,
              maxWidth: 900,
              maxHeight: 900,
            }}
          ></View>
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
      return (
        r1._id !== r2._id || r1.liked !== r2.liked || r1.likes !== r2.likes
      );
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

  const userHistoryRowRenderer = (_, item) =>
    showJobHistoryModal ? (
      <JobHistoryItem jobRole={item} />
    ) : (
      <EducationHistoryItem education={item} />
    );

  let userHistoryDataProvider = new DataProvider(
    (r1, r2) => {
      return r1._id !== r2._id;
    }
    // (index) => `${userPosts[index]?._id}`
  ).cloneWithRows(
    (showJobHistoryModal ? userJobHistory : userEducationHistory) || []
  );

  const userHistorylayoutProvider = useRef(
    new LayoutProvider(
      () => 0,
      (_, dim) => {
        dim.width = screenWidth;
        dim.height = 200;
      }
    )
  ).current;

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
  }, [userId]);

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
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: themeStyle.colors.grayscale.cardsOuter,
        }}
      >
        <Modal
          visible={showJobHistoryModal || showEducationHistoryModal}
          onRequestClose={() => {
            setShowJobHistoryModal(false);
            setShowEducationHistoryModal(false);
          }}
        >
          <SafeAreaView
            style={{
              backgroundColor: themeStyle.colors.grayscale.highest,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: themeStyle.colors.grayscale.highest,
                justifyContent: "center",
                maxWidth: 900,
                width: "100%",
                padding: 15,
              }}
            >
              {loadingHistory ? (
                <View
                  style={{
                    backgroundColor: themeStyle.colors.grayscale.cards,
                    marginVertical: 2,
                    justifyContent: "flex-start",
                    flex: 1,
                  }}
                >
                  {[...Array(6)].map((_, i) => (
                    <JobAndEducationHistoryLoader key={`loader-${i}`} />
                  ))}
                </View>
              ) : userJobHistory?.length || userEducationHistory?.length ? (
                <>
                  <View
                    style={{
                      alignSelf: "flex-start",
                      marginVertical: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setShowJobHistoryModal(false);
                        setShowEducationHistoryModal(false);
                      }}
                      style={{
                        justifyContent: "center",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <AntDesign
                        name="arrowleft"
                        size={24}
                        color={themeStyle.colors.grayscale.lowest}
                      />
                      <Text
                        style={{
                          color: themeStyle.colors.grayscale.lowest,
                          fontSize: 16,
                          marginHorizontal: 10,
                        }}
                      >
                        {showJobHistoryModal
                          ? "Work History"
                          : "Education History"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <RecyclerListView
                    style={{ flex: 1 }}
                    dataProvider={userHistoryDataProvider}
                    layoutProvider={userHistorylayoutProvider}
                    rowRenderer={userHistoryRowRenderer}
                    forceNonDeterministicRendering
                  />
                </>
              ) : null}
            </View>
          </SafeAreaView>
        </Modal>
        <RecyclerListView
          {...mobileSpecificListProps}
          style={{ minHeight: 1, minWidth: 1 }}
          dataProvider={dataProvider}
          layoutProvider={layoutProvider}
          onEndReached={() => getUserPosts()}
          onEndReachedThreshold={0.5}
          rowRenderer={rowRenderer}
          extendedState={{ userData, profileVideoVisible }}
          forceNonDeterministicRendering
          onVisibleIndicesChanged={(i) => {
            // TODO: test on old device to see if preview video rerenders cause crashes
            if (i?.[0] === 0 && !profileVideoVisible) {
              setProfileVideoVisible(true);
            } else if (profileVideoVisible) {
              setProfileVideoVisible(false);
            }
          }}
          scrollViewProps={{
            contentContainerStyle: {
              maxWidth: 900,
              alignSelf: "center",
            },
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
  return <ProfileLoader />;
};

export default UserProfileScreen;
