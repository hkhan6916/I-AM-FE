import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import VideoPlayer from "../../../components/VideoPlayer";
import { useNavigation } from "@react-navigation/native";
import apiCall from "../../../helpers/apiCall";
import PostCard from "../../../components/PostCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import themeStyle from "../../../theme.style";
import { LinearGradient } from "expo-linear-gradient";

const ProfileScreen = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);
  const [scrollTimeout, setScrollTimeout] = useState(null);
  const navigation = useNavigation();

  const flatlistRef = useRef(null);

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
    minimumViewTime: 1000,
  };

  const viewabilityConfigCallbackPairs = useRef([
    { onViewableItemsChanged, viewabilityConfig },
  ]);

  const renderPosts = ({ item, index }) => (
    <View>
      <PostCard isVisible={visibleItems.includes(item._id)} post={item} />
      {loading && index === userPosts.length - 1 ? (
        <ActivityIndicator
          size="large"
          color={themeStyle.colors.grayscale.lightGray}
        />
      ) : null}
    </View>
  );
  const renderProfileInfo = () => (
    <View>
      <TouchableOpacity onPress={() => navigation.navigate("SettingsScreen")}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderBottomWidth: 1,
          }}
        >
          <Text style={{ fontSize: 20 }} numberOfLines={1}>
            {userData.username}
          </Text>
          <MaterialCommunityIcons name="cog-outline" size={24} color="black" />
        </View>
      </TouchableOpacity>
      <LinearGradient
        start={[0, 0.5]}
        end={[1, 0.5]}
        style={{ padding: 4 }}
        colors={[
          themeStyle.colors.grayscale.white,
          themeStyle.colors.primary.light,
        ]}
      >
        <View
          style={{
            width: "100%",
            borderColor: themeStyle.colors.primary.default,
            backgroundColor: "white",
          }}
        >
          <VideoPlayer
            url={userData.profileVideoUrl}
            mediaHeaders={userData.profileVideoHeaders}
            mediaIsSelfie
            isProfileVideo
          />
        </View>
      </LinearGradient>
    </View>
  );

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
            renderItem={renderPosts}
            keyExtractor={(item, index) => `${item._id}-${index}`}
            refreshControl={
              <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
            }
            ListHeaderComponent={renderProfileInfo}
            contentContainerStyle={{ flexGrow: 1 }}
            onEndReached={() => getUserPosts()}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            // windowSize={5} // this causes re renders of postcard keep until causes issues :()
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
