import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import themeStyle from "../../../../theme.style";
import PostCard from "../../../../components/PostCard";
import apiCall from "../../../../helpers/apiCall";
import { useScrollToTop } from "@react-navigation/native";
import PostOptionsModal from "../../../../components/PostOptionsModal";
import HomeScreenHeader from "./HomeScreenHeader";
// import * as FacebookAds from "expo-ads-facebook";
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from "recyclerlistview";
import FastImage from "react-native-fast-image";
// import ContentLoader from "../../../../components/ContentLoader";
import PostCardLoader from "../../../../components/ContentLoader/PostCard";

const { statusBarHeight } = Constants;

const HomeScreen = () => {
  const dispatch = useDispatch();
  const newPostCreated = useSelector((state) => state.postCreated);
  const canPlayFeedVideos = useSelector((state) => state.canPlayFeedVideos);

  const [isFocussed, setFocussed] = useState(false);
  const [feed, setFeed] = useState(null);
  const [originalFeed, setOriginalFeed] = useState(null);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [userData, setUserData] = useState({});
  const [postIds, setPostIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionsAsSenderOffset, setConnectionsAsSenderOffset] = useState(0);
  const [connectionsAsReceiverOffset, setConnectionsAsReceiverOffset] =
    useState(0);
  const [loading, setLoading] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(null);
  const [error, setError] = useState("");
  const [feedError, setFeedError] = useState("");
  const [currentVisible, setCurrentVisible] = useState(0);
  const [prevVisible, setPrevVisible] = useState(0);
  const navigation = useNavigation();
  const listRef = useRef(null);
  const [scrolling, setScrolling] = useState(false);
  const [positionBeforeScroll, setPositionBeforeScroll] = useState(0);

  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

  useScrollToTop(
    useRef({
      scrollToTop: () => {
        setCurrentVisible(0);
        listRef.current?.scrollToOffset({ offset: 2000 });
      },
    })
  );

  // const adsManager = new FacebookAds.NativeAdsManager(
  //   "3130380047243958_3167702336845062",
  //   10
  // );

  const calculateOffsets = async () => {
    if (!originalFeed?.length) {
      return {};
    }
    let i = 0;

    let friendsInterestsOffset = 0;
    while (i < originalFeed.length) {
      if (originalFeed[i]?.likedBy) {
        friendsInterestsOffset += 1;
      }
      i += 1;
    }

    return {
      friendsInterestsOffset,
      feedTimelineOffset: originalFeed.length - friendsInterestsOffset,
      connectionsAsSenderOffset: connectionsAsSenderOffset,
      connectionsAsReceiverOffset: connectionsAsReceiverOffset,
    };
  };

  const renderFooter = () => (
    <View style={{ marginVertical: 20 }}>
      {allPostsLoaded ? (
        <Text
          style={{
            color: themeStyle.colors.grayscale.lowest,
            textAlign: "center",
          }}
        >
          That&apos;s all for now.
        </Text>
      ) : (
        <ActivityIndicator animating size={"large"} />
      )}
    </View>
  );

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

  const editPost = () => navigation.navigate("Add");

  const deletePost = async () => {
    const { success } = await apiCall(
      "DELETE",
      `/posts/remove/${showPostOptions?._id}`
    );
    if (success) {
      const newPosts = feed.map((post) => {
        if (post._id === showPostOptions?._id) {
          return {
            ...post,
            deleted: true,
            customKey: `${post._id}-deleted}`,
          };
        }
        return post;
      });
      setFeed(newPosts);
      setShowPostOptions(null);
    }
  };

  const getUserFeed = async () => {
    if (!allPostsLoaded && !refreshing && !loading) {
      const offsets = await calculateOffsets();
      setLoading(true);
      const { success, response } = await apiCall(
        "POST",
        "/user/feed",
        offsets
      );
      setLoading(false);
      if (success) {
        if (!response.feed?.length || response.feed.length === 1) {
          setAllPostsLoaded(true);
        } else {
          const noDuplicatesResponse = response.feed.filter((post) => {
            if (!postIds.includes(post._id.toString())) return post;
          });
          setOriginalFeed([...originalFeed, ...(response.feed || [])]);
          setFeed([...feed, ...noDuplicatesResponse]);
          const ids = [
            ...postIds,
            ...response.feed.map((post) => post._id.toString()),
          ];
          setPostIds(ids);
          // setFeed([...feed, ...(response.feed || [])]);
          // dataProvider.cloneWithRows([
          //   ...feed,
          //   ...response.feed.filter((post) => {
          //     if (!postIds.includes(post._id.toString())) return post;
          //   }),
          // ]);
          setConnectionsAsSenderOffset(response.connectionsAsSenderOffset);
          setConnectionsAsReceiverOffset(response.connectionsAsReceiverOffset);
        }
      } else if (feed.length) {
        setFeedError(
          "Sorry... there was a problem loading more posts, please try again later."
        );
        setAllPostsLoaded(true);
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setAllPostsLoaded(false);
    setRefreshing(true);
    const { success, response } = await apiCall("POST", "/user/feed");
    const ids = [
      ...postIds,
      ...response.feed.map((post) => post._id.toString()),
    ];
    setRefreshing(false);
    if (success) {
      setPostIds(ids);
      setConnectionsAsReceiverOffset(0);
      setConnectionsAsSenderOffset(0);
      setFeed(response.feed);
      setOriginalFeed(response.feed);
    }
  }, []);

  const handleReaction = async (post) => {
    const oldFeed = feed || originalFeed;

    if (post.liked) {
      setFeed((prev) => {
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
        setFeed(oldFeed);
      }

      return;
    }

    setFeed((prev) => {
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
      setFeed(oldFeed);
    }
  };

  const handleUnMute = (state) => {
    dispatch({ type: "SET_GLOBAL_UNMUTE_VIDEOS", payload: state });

    // setFeed((prevFeed) => {
    //   return prevFeed.map((post) => ({ ...post, unMute: state }));
    // });
  };
  const rowRenderer = useCallback(
    (_, item, index, extendedState) => {
      return (
        <PostCard
          setShowPostOptions={triggerOptionsModal}
          loadingMore={loading && index === feed.length - 1}
          isVisible={
            extendedState.currentVisible === index &&
            !extendedState.scrolling &&
            isFocussed
          }
          setUnMuteVideos={handleUnMute}
          currentVisible={extendedState.currentVisible}
          index={index}
          post={item}
          screenHeight={screenHeight}
          screenWidth={screenWidth}
          handleReaction={handleReaction}
          handleNavigation={handleNavigation}
        />
      );
    },
    [isFocussed]
  );
  const triggerOptionsModal = (post) => {
    setError("");
    setShowPostOptions(post);
  };

  useEffect(() => {
    navigation.addListener("focus", async () => {
      FastImage.clearMemoryCache();
      setFocussed(true);
      const { success, response } = await apiCall("GET", "/user/data");
      if (success) {
        setUserData(response);
      }
    });
    navigation.addListener("blur", async () => {
      setFocussed(false);
    });
    return () => {
      navigation.removeListener("focus");
      navigation.removeListener("blur");
    };
  }, []);

  useEffect(() => {
    if (!feed) return;
    const ids = [...postIds, ...feed.map((post) => post._id.toString())];
    setPostIds(ids);

    if (newPostCreated.state) {
      setTimeout(() => {
        dispatch({ type: "SET_POST_CREATED", payload: false });
      }, 3000);
    }
  }, [newPostCreated, feed]);

  let dataProvider = new DataProvider(
    (r1, r2) => {
      return (
        r1._id !== r2._id || r1.liked !== r2.liked || r1.likes !== r2.likes
      );
    }
    // (index) => `${postIds[index]}`
  ).cloneWithRows(feed || []);

  const layoutProvider = useRef(
    new LayoutProvider(
      () => 0,
      (type, dim) => {
        dim.width = screenWidth;
        dim.height = 490;
      }
    )
  ).current;

  const _applyWindowCorrection = (offset, offsetY, windowCorrection) => {
    // This may need to be calculated based on screen height but works for now
    windowCorrection.startCorrection = 220;
  };

  useEffect(() => {
    (async () => {
      const { success, response } = await apiCall("POST", "/user/feed");

      if (success) {
        setFeed(response.feed);
        setOriginalFeed(response.feed);
      }
    })();
  }, []);

  if (!feed) {
    // if (feed) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: themeStyle.colors.grayscale.cardsOuter,
        }}
      >
        <HomeScreenHeader navigation={navigation} userData={userData} />
        <PostCardLoader hasImage screenWidth={screenWidth} />
        <PostCardLoader hasImage screenWidth={screenWidth} />
        <PostCardLoader hasImage screenWidth={screenWidth} />
      </SafeAreaView>
    );
  }

  if (feed?.length) {
    return (
      <SafeAreaView style={styles.container}>
        {/* <Button title="test" onPress={() => navigation.navigate("Test")} /> */}
        <View style={{ flex: 1 }}>
          <HomeScreenHeader navigation={navigation} userData={userData} />
          {newPostCreated.state ? (
            <View style={styles.newPostPill}>
              <Text style={{ color: themeStyle.colors.white }}>
                Post {newPostCreated.state.type}
              </Text>
            </View>
          ) : null}
          <RecyclerListView
            ref={listRef}
            applyWindowCorrection={_applyWindowCorrection}
            style={{ minHeight: 1, minWidth: 1 }}
            dataProvider={dataProvider}
            layoutProvider={layoutProvider}
            onEndReached={() => getUserFeed()}
            onEndReachedThreshold={0.5}
            // initialRenderIndex={currentVisible + 1}
            extendedState={{
              currentVisible: canPlayFeedVideos ? currentVisible : null,
              scrolling: canPlayFeedVideos ? scrolling : null,
            }}
            rowRenderer={rowRenderer}
            renderAheadOffset={screenHeight}
            forceNonDeterministicRendering
            renderFooter={renderFooter}
            onScroll={(event) => {
              if (
                !scrolling &&
                Math.abs(
                  event.nativeEvent.contentOffset.y - positionBeforeScroll
                ) > 300 &&
                currentVisible !== 0
                // if they scroll far enough, enable scroll to pause video
              ) {
                setScrolling(true);
                setPositionBeforeScroll(event.nativeEvent.contentOffset.y);
              }
            }}
            onVisibleIndicesChanged={async (items) => {
              if (typeof items[0] === "number" && items[0] !== currentVisible) {
                setCurrentVisible(items[0]);
              }
            }}
            scrollViewProps={{
              // decelerationRate: 0.9,
              removeClippedSubviews: true,
              onMomentumScrollEnd: () => {
                if (prevVisible !== currentVisible) {
                  setScrolling(false);
                }
              },
              refreshControl: (
                <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
              ),
            }}
          />
        </View>

        <PostOptionsModal
          showOptions={!!showPostOptions}
          setShowPostOptions={setShowPostOptions}
          reportPost={reportPost}
          deletePost={deletePost}
          editPost={editPost}
          belongsToUser={false}
          error={error}
        />
      </SafeAreaView>
    );
  }
  return (
    <ScrollView
      contentContainerStyle={{ flex: 1 }}
      refreshControl={
        <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
      }
    >
      {/* <Button title="test" onPress={() => navigation.navigate("AdScreen")} /> */}

      <SafeAreaView>
        <HomeScreenHeader userData={userData} navigation={navigation} />
        {newPostCreated.state ? (
          <Text style={styles.newPostPill}>
            Post {newPostCreated.state.type}
          </Text>
        ) : null}
        {userData.profileVideoUrl ? (
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Feather
              name="coffee"
              size={100}
              color={themeStyle.colors.grayscale.high}
            />
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  color: themeStyle.colors.grayscale.lowest,
                }}
              >
                It&apos;s quiet here...
              </Text>
              <Text
                style={{
                  marginBottom: 20,
                  fontWeight: "700",
                  color: themeStyle.colors.grayscale.lowest,
                }}
              >
                Try adding some people.
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Search")}>
                <View
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    borderWidth: 1,
                    borderColor: themeStyle.colors.secondary.default,
                    borderRadius: 5,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      color: themeStyle.colors.grayscale.lowest,
                    }}
                  >
                    Search
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <MaterialCommunityIcons
              name="account-alert-outline"
              size={150}
              color={themeStyle.colors.grayscale.high}
            />
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  marginBottom: 20,
                  color: themeStyle.colors.grayscale.lowest,
                  width: 250,
                  textAlign: "center",
                }}
              >
                Complete your profile by adding a profile video.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("EditUserDetailsScreen")}
              >
                <View
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    backgroundColor: themeStyle.colors.secondary.default,
                    borderRadius: 5,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      color: themeStyle.colors.white,
                    }}
                  >
                    Complete profile
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  newPostPill: {
    zIndex: 3, // works on ios
    elevation: 3, // works on android
    backgroundColor: themeStyle.colors.primary.default,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "center",
    position: "absolute",
    marginTop: statusBarHeight + 30,
    color: themeStyle.colors.white,
  },
});

export default HomeScreen;
