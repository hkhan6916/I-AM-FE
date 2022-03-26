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
  StatusBar,
  FlatList,
  ActivityIndicator,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  Button,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import themeStyle from "../../../theme.style";
import FeedContext from "../../../Context";
import PostCard from "../../../components/PostCard";
import apiCall from "../../../helpers/apiCall";
import Logo from "../../../Logo";
import { useScrollToTop } from "@react-navigation/native";
import PostOptionsModal from "../../../components/PostOptionsModal";
import * as FacebookAds from "expo-ads-facebook";

const { statusBarHeight } = Constants;

const HomeScreen = () => {
  const dispatch = useDispatch();
  const newPostCreated = useSelector((state) => state.postCreated);
  const initialFeed = useContext(FeedContext);
  const [feed, setFeed] = useState(initialFeed);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [postIds, setPostIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);
  const [connectionsAsSenderOffset, setConnectionsAsSenderOffset] = useState(0);
  const [connectionsAsReceiverOffset, setConnectionsAsReceiverOffset] =
    useState(0);
  const [loading, setLoading] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(null);
  const [error, setError] = useState("");

  const colorSchema = useColorScheme();

  const navigation = useNavigation();
  const flatlistRef = useRef(null);

  useScrollToTop(flatlistRef);

  const adsManager = new FacebookAds.NativeAdsManager(
    "3130380047243958_3167702336845062",
    10
  );

  const calculateOffsets = async () => {
    if (!feed.length) {
      return {};
    }
    let i = 0;
    let friendsInterestsOffset = 0;
    while (i < feed.length) {
      if (feed[i].likedBy) {
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
      const newComments = feed.map((post) => {
        if (post._id === showPostOptions?._id) {
          return {
            ...post,
            deleted: true,
            customKey: `${post._id}-deleted}`,
          };
        }
        return post;
      });
      setFeed(newComments);
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
          setFeed([
            ...feed,
            ...response.feed.filter((post) => {
              if (!postIds.includes(post._id.toString())) return post;
            }),
          ]);
          setConnectionsAsSenderOffset(response.connectionsAsSenderOffset);
          setConnectionsAsReceiverOffset(response.connectionsAsReceiverOffset);
        }
      } else if (feed.length) {
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
  // const viewabilityConfig = {
  //   waitForInteraction: true,
  //   viewAreaCoveragePercentThreshold: 100,
  //   minimumViewTime: 1000,
  // };

  // const viewabilityConfigCallbackPairs = useRef([
  //   { onViewableItemsChanged, viewabilityConfig },
  // ]);

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

  const HomeHeading = () => (
    <View>
      <StatusBar
        backgroundColor={themeStyle.colors.black}
        barStyle="light-content"
      />
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor:
            colorSchema === "dark"
              ? themeStyle.colors.grayscale.highest
              : themeStyle.colors.grayscale.higher,
          borderBottomWidth: 1,
          borderBottomColor: themeStyle.colors.grayscale.lowest,
        }}
      >
        <View style={{ marginHorizontal: 20 }}>
          <Logo fill={themeStyle.colors.grayscale.lowest} />
        </View>
        <TouchableOpacity
          style={{ padding: 10, marginRight: 10 }}
          onPress={() => navigation.navigate("ChatListScreen")}
        >
          <Ionicons
            name="paper-plane-outline"
            size={24}
            color={themeStyle.colors.grayscale.lowest}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      return (
        <PostCard
          setShowPostOptions={triggerOptionsModal}
          loadingMore={loading && index === feed.length - 1}
          isVisible={visibleItems.includes(item._id)}
          post={item}
          adsManager={index && index % 5 === 0 ? adsManager : null}
        />
      );
    },
    [postIds]
  );

  const keyExtractor = useCallback((item) => item._id, []);

  const triggerOptionsModal = (post) => {
    setError("");
    setShowPostOptions(post);
  };

  useEffect(() => {
    const ids = [...postIds, ...feed.map((post) => post._id.toString())];
    setPostIds(ids);

    if (newPostCreated.state) {
      setTimeout(() => {
        dispatch({ type: "SET_POST_CREATED", payload: false });
      }, 3000);
    }
  }, [newPostCreated, feed]);

  if (feed.length) {
    return (
      <SafeAreaView style={styles.container}>
        {/* <Button title="test" onPress={() => navigation.navigate("Test")} /> */}
        <View>
          {newPostCreated.state ? (
            <View style={styles.newPostPill}>
              <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                Post {newPostCreated.state.type}
              </Text>
            </View>
          ) : null}
          <HomeHeading />
          <FlatList
            ref={flatlistRef}
            // viewabilityConfigCallbackPairs={
            //   viewabilityConfigCallbackPairs.current
            // }
            extraData={postIds.length}
            data={feed}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            refreshControl={
              <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
            }
            ListFooterComponent={() => (
              <View
                style={{
                  margin: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator
                  size="large"
                  animating={loading}
                  color={themeStyle.colors.grayscale.lowest}
                />
                {allPostsLoaded ? (
                  <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                    That&apos;s everything for now!
                  </Text>
                ) : null}
              </View>
            )}
            contentContainerStyle={{ flexGrow: 1 }}
            onEndReached={() => getUserFeed()}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
          />
          <PostOptionsModal
            showOptions={!!showPostOptions}
            setShowPostOptions={setShowPostOptions}
            reportPost={reportPost}
            deletePost={deletePost}
            editPost={editPost}
            belongsToUser={false}
            error={error}
          />
        </View>
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
        <HomeHeading />
        {newPostCreated.state ? (
          <Text style={styles.newPostPill}>
            Post {newPostCreated.state.type}
          </Text>
        ) : null}
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
