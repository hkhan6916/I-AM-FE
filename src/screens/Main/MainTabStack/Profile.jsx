import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import apiCall from "../../../helpers/apiCall";
import PostCard from "../../../components/PostCard";
import themeStyle from "../../../theme.style";
import ProfileScreenHeader from "../../../components/ProfileScreenHeader";
import { useScrollToTop } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

  const getUserPosts = async (refreshing) => {
    if (!allPostsLoaded || (allPostsLoaded && refreshing)) {
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
    await getUserData();
    await getUserPosts(true);
    setRefreshing(false);
    if (success) {
      setUserPosts(response);
    }
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

  const renderItem = useCallback(
    ({ item }) => (
      <PostCard isVisible={visibleItems.includes(item._id)} post={item} />
    ),
    []
  );

  const keyExtractor = useCallback((item) => item._id, []);

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
  return (
    <SafeAreaView style={styles.container}>
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
        <TouchableOpacity onPress={() => navigation.navigate("SettingsScreen")}>
          <MaterialCommunityIcons name="cog-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      {userData ? (
        <FlatList
          ref={flatlistRef}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          data={userPosts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
          ListHeaderComponent={() => (
            <ProfileScreenHeader userData={userData} navigation={navigation} />
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
