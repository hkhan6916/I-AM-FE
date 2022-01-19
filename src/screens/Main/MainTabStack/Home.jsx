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
} from "react-native";
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

const { statusBarHeight } = Constants;

const HomeScreen = () => {
  const dispatch = useDispatch();
  const newPostCreated = useSelector((state) => state.postCreated);
  const initialFeed = useContext(FeedContext);
  const [feed, setFeed] = useState(initialFeed);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);
  const [connectionsAsSenderOffset, setConnectionsAsSenderOffset] = useState(0);
  const [connectionsAsReceiverOffset, setConnectionsAsReceiverOffset] =
    useState(0);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const flatlistRef = useRef(null);

  useScrollToTop(flatlistRef);

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

  const getUserFeed = async () => {
    if (!allPostsLoaded && !refreshing) {
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
          setFeed([...feed, ...response.feed]);
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
  const viewabilityConfig = {
    waitForInteraction: true,
    viewAreaCoveragePercentThreshold: 50,
    minimumViewTime: 2000,
  };

  const viewabilityConfigCallbackPairs = useRef([
    { onViewableItemsChanged, viewabilityConfig },
  ]);

  const onRefresh = useCallback(async () => {
    setAllPostsLoaded(false);
    setRefreshing(true);
    const { success, response } = await apiCall("POST", "/user/feed");
    setRefreshing(false);
    if (success) {
      setConnectionsAsReceiverOffset(0);
      setConnectionsAsSenderOffset(0);
      setFeed(response.feed);
    }
  }, []);

  useEffect(() => {
    if (newPostCreated.state) {
      setTimeout(() => {
        dispatch({ type: "SET_POST_CREATED", payload: false });
      }, 3000);
    }
  }, [newPostCreated, feed]);
  return (
    <View style={styles.container}>
      {newPostCreated.state ? (
        <Text style={styles.newPostPill}>Post {newPostCreated.state.type}</Text>
      ) : null}
      <StatusBar
        backgroundColor={themeStyle.colors.grayscale.black}
        barStyle="light-content"
      />
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: themeStyle.colors.grayscale.white,
          borderBottomWidth: 1,
          borderBottomColor: themeStyle.colors.grayscale.black,
        }}
      >
        <View style={{ marginHorizontal: 20 }}>
          <Logo fill={themeStyle.colors.grayscale.black} />
        </View>
        <TouchableOpacity
          style={{ padding: 10, marginRight: 10 }}
          onPress={() => navigation.navigate("ChatListScreen")}
        >
          <Ionicons
            name="paper-plane-outline"
            size={24}
            color={themeStyle.colors.grayscale.black}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatlistRef}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        data={feed}
        renderItem={({ item, index }) => (
          <PostCard
            loadingMore={loading && index === feed.length - 1}
            isVisible={visibleItems.includes(item._id)}
            post={item}
          />
        )}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={() => getUserFeed()}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        // windowSize={5} // this causes re renders of postcard :()
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  newPostPill: {
    zIndex: 3, // works on ios
    elevation: 3, // works on android
    backgroundColor: themeStyle.colors.secondary.bright,
    color: themeStyle.colors.grayscale.white,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "center",
    position: "absolute",
    marginTop: statusBarHeight + 30,
  },
});

export default HomeScreen;
