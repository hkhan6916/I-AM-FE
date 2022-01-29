import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import apiCall from "../../../helpers/apiCall";
import PostCard from "../../../components/PostCard";
import themeStyle from "../../../theme.style";
import ProfileInfo from "../../../components/ProfileInfo";
import { useScrollToTop } from "@react-navigation/native";

const ProfileScreen = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);

  const navigation = useNavigation();

  const flatlistRef = useRef(null);

  useScrollToTop(flatlistRef);

  const getUserPosts = async () => {
    if (!allPostsLoaded) {
      const { success, response } = await apiCall(
        "GET",
        `/user/posts/${userPosts.length}`
      );
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

  const getUserData = async () => {
    setLoading(true);
    const { success, response } = await apiCall("GET", `/user/data`);

    if (success) {
      setUserData(response);
    }
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const { success, response } = await apiCall(
      "GET",
      `/user/posts/${userPosts.length}`
    );
    setRefreshing(false);
    if (success) {
      setUserPosts(response);
    }
  }, []);

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (isMounted) {
        await getUserData();
        await getUserPosts();
      }
    })();
    return () => {
      setUserPosts([]);
      isMounted = false;
    };
  }, []);
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

  return (
    <SafeAreaView style={styles.container}>
      {userData ? (
        <View
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              getUserPosts();
            }
          }}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
        >
          <View style={{ flexDirection: "row" }}>
            <Text>{userData.numberOfFriends} friends</Text>
          </View>
          <FlatList
            ref={flatlistRef}
            viewabilityConfigCallbackPairs={
              viewabilityConfigCallbackPairs.current
            }
            data={userPosts}
            renderItem={({ item }) => (
              <PostCard
                isVisible={visibleItems.includes(item._id)}
                post={item}
              />
            )}
            keyExtractor={(item, index) => `${item._id}-${index}`}
            refreshControl={
              <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
            }
            ListHeaderComponent={() => (
              <ProfileInfo userData={userData} navigation={navigation} />
            )}
            ListFooterComponent={() => (
              <ActivityIndicator
                size="large"
                animating={loading}
                color={themeStyle.colors.grayscale.lightGray}
              />
            )}
            contentContainerStyle={{ flexGrow: 1 }}
            onEndReached={() => getUserPosts()}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            // windowSize={5}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default ProfileScreen;
