import React, {
  useEffect,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import themeStyle from "../../../../theme.style";
import FeedContext from "../../../../Context";
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

const { statusBarHeight } = Constants;

const HomeScreen = () => {
  const dispatch = useDispatch();
  const newPostCreated = useSelector((state) => state.postCreated);
  const [isFocussed, setFocussed] = useState(false);
  const initialFeed = useContext(FeedContext);
  const [feed, setFeed] = useState(initialFeed);
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
  const [preventCleanup, setPreventCleanup] = useState(false);
  const [feedError, setFeedError] = useState("");
  const [currentVisible, setCurrentVisible] = useState(0);
  const [prevVisible, setPrevVisible] = useState(0);
  const [allVisible, setAllVisible] = useState([]);
  const navigation = useNavigation();
  const flatlistRef = useRef(null);
  const [scrolling, setScrolling] = useState(false);

  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
  useScrollToTop(flatlistRef);

  // const adsManager = new FacebookAds.NativeAdsManager(
  //   "3130380047243958_3167702336845062",
  //   10
  // );

  const calculateOffsets = async () => {
    if (!feed?.length) {
      return {};
    }
    let i = 0;

    let friendsInterestsOffset = 0;
    while (i < feed.length) {
      if (feed[i]?.likedBy) {
        friendsInterestsOffset += 1;
      }
      i += 1;
    }

    return {
      friendsInterestsOffset,
      feedTimelineOffset: feed.length - friendsInterestsOffset,
      connectionsAsSenderOffset: connectionsAsSenderOffset,
      connectionsAsReceiverOffset: connectionsAsReceiverOffset,
    };
  };

  const handleNavigation = (post) => {
    setPreventCleanup(true);
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
        if (!response.feed?.length) {
          setAllPostsLoaded(true);
        } else {
          const ids = [
            ...postIds,
            ...response.feed.map((post) => post._id.toString()),
          ];
          setPostIds(ids);
          setFeed(
            ...[
              ...feed,
              ...response.feed.filter((post) => {
                if (!postIds.includes(post._id.toString())) return post;
              }),
            ]
          );
          dataProvider.cloneWithRows([
            ...feed,
            ...response.feed.filter((post) => {
              if (!postIds.includes(post._id.toString())) return post;
            }),
          ]);
          setConnectionsAsSenderOffset(response.connectionsAsSenderOffset);
          setConnectionsAsReceiverOffset(response.connectionsAsReceiverOffset);
        }
      } else if (feed.length) {
        setFeedError(
          "Sorry... Magnet could not any load posts, please try again later."
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
    setPostIds(ids);
    setRefreshing(false);
    if (success) {
      setConnectionsAsReceiverOffset(0);
      setConnectionsAsSenderOffset(0);
      setFeed(response.feed);
    }
  }, []);

  const handleReaction = async (post) => {
    const oldFeed = feed;

    if (post.liked) {
      setFeed((prev) => {
        return prev.map((p) => {
          if (p._id === post._id) {
            return { ...p, liked: false };
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
          return { ...p, liked: true };
        }
        return p;
      });
    });
    const { success } = await apiCall("GET", `/posts/like/add/${post._id}`);
    if (!success) {
      setFeed(oldFeed);
    }
  };

  const rowRenderer = useCallback(
    (type, item, index, extendedState) => {
      return (
        <PostCard
          setShowPostOptions={triggerOptionsModal}
          loadingMore={loading && index === feed.length - 1}
          isVisible={
            extendedState.currentVisible === index && !extendedState.scrolling
          }
          currentVisible={extendedState.currentVisible}
          index={index}
          post={item}
          screenHeight={screenHeight}
          screenWidth={screenWidth}
          handleReaction={handleReaction}
          handleNavigation={handleNavigation}
          unmount={!isFocussed}
        />
      );
    },
    [postIds]
  );
  const triggerOptionsModal = (post) => {
    setError("");
    setShowPostOptions(post);
  };

  useEffect(() => {
    navigation.addListener("focus", async () => {
      setFocussed(true);
      setPreventCleanup(false);
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
      return r1._id !== r2._id || r1.liked !== r2.liked;
    },
    (index) => `${feed[index]?._id}`
  ).cloneWithRows(feed);

  const layoutProvider = useRef(
    new LayoutProvider(
      () => 0,
      (type, dim) => {
        dim.width = screenWidth;
        dim.height = 490;
      }
    )
  ).current;

  if (feed.length) {
    return (
      <SafeAreaView style={styles.container}>
        {/* <Button title="test" onPress={() => navigation.navigate("Test")} /> */}
        <HomeScreenHeader navigation={navigation} userData={userData} />
        {newPostCreated.state ? (
          <View style={styles.newPostPill}>
            <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
              Post {newPostCreated.state.type}
            </Text>
          </View>
        ) : null}
        {console.log("redner")}
        <View style={{ flex: 1 }}>
          <RecyclerListView
            style={{ minHeight: 1, minWidth: 1 }}
            dataProvider={dataProvider}
            layoutProvider={layoutProvider}
            onEndReached={() => getUserFeed()}
            onEndReachedThreshold={0.5}
            // initialRenderIndex={currentVisible + 1}
            extendedState={{ currentVisible, scrolling }}
            rowRenderer={rowRenderer}
            renderAheadOffset={screenHeight}
            forceNonDeterministicRendering
            applyWindowCorrection={(offset, offsetY, windowCorrection) => {
              // windowCorrection.endCorrection = 100;
              // windowCorrection.startCorrection = -100;
            }}
            onScroll={() => !scrolling && setScrolling(true)}
            onVisibleIndicesChanged={(items) => {
              if (items[0] && items[0] !== currentVisible) {
                setCurrentVisible(items[0]);
              }
            }}
            scrollViewProps={{
              onMomentumScrollEnd: () => {
                if (prevVisible !== currentVisible) {
                  setScrolling(false);
                }
              },
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
                  color: themeStyle.colors.graysczale.lowest,
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
                    borderWidth: 1,
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
  },
});

export default HomeScreen;
