import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import VideoPlayer from "../../../components/VideoPlayer";
import { useNavigation } from "@react-navigation/native";
import apiCall from "../../../helpers/apiCall";
import PostCard from "../../../components/PostCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ProfileScreen = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

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
  return (
    <SafeAreaView style={styles.container}>
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
      {userData ? (
        <ScrollView
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              getUserPosts();
            }
          }}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
        >
          <View style={{ width: "100%" }}>
            <VideoPlayer
              url={userData.profileVideoUrl}
              mediaHeaders={userData.profileVideoHeaders}
              mediaIsSelfie
              isProfileVideo
            />
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text>{userData.numberOfFriends} friends</Text>
          </View>
          {userPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </ScrollView>
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
