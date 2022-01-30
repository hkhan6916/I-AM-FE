import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  SafeAreaView,
} from "react-native";

import apiCall from "../../../helpers/apiCall";
import VideoPlayer from "../../../components/VideoPlayer";
import { useNavigation, useScrollToTop } from "@react-navigation/native";
import themeStyle from "../../../theme.style";
import ProfileInfo from "../../../components/ProfileInfo";
import PostCard from "../../../components/PostCard";

const UserProfileScreen = (props) => {
  const { userId } = props.route.params;
  const [user, setUser] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);

  const navigation = useNavigation();

  const flatlistRef = useRef(null);

  const sendFriendRequest = async () => {
    const userRequestSent = { ...user, requestSent: true };

    setUser(userRequestSent);

    const { success, error, message } = await apiCall(
      "GET",
      `/user/friend/request/send/${userId}`
    );
    console.log(message);
    if (!success || error === "CONNECTION_FAILED") {
      const userRequestRemoved = { ...user, requestSent: false };
      setUser(userRequestRemoved);
    }
  };

  const recallFriendRequest = async () => {
    const userRequestSent = { ...user, requestSent: false };

    setUser(userRequestSent);
    const { success, error, message } = await apiCall(
      "GET",
      `/user/friend/request/recall/${userId}`
    );
    console.log(message);
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
  };

  const rejectFriendRequest = async () => {
    const userRequestRejected = { ...user, requestReceived: false };

    setUser(userRequestRejected);
    const { success, error, message } = await apiCall(
      "GET",
      `/user/friend/request/reject/${userId}`
    );
    console.log(message);
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

    if (!success || error === "CONNECTION_FAILED") {
      const userIsFriend = { ...user, isFriend: true, requestReceived: false };

      setUser(userIsFriend);
    }
  };

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
    const { success, response } = await apiCall(
      "GET",
      `/user/posts/${userPosts.length}`
    );
    setRefreshing(false);
    if (success) {
      setUserPosts(response);
    }
  }, []);
  useEffect(() => {
    let isMounted = true;

    (async () => {
      if (isMounted) {
        const { success, response } = await apiCall("GET", `/user/${userId}`);
        if (success) {
          setUser(response.otherUser);
        }
        await getUserPosts();
      }
    })();
    return () => {
      setUser({});
      setUserPosts([]);
      isMounted = false;
    };
  }, []);

  if (user && user._id) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        {!user.isSameUser ? (
          <View>
            {user.isFriend ? (
              <Button
                title="Remove From Friends"
                onPress={() => removeConnection()}
              />
            ) : user.requestReceived ? (
              <View>
                <Button
                  title="Accept Request"
                  onPress={() => acceptFriendRequest()}
                />
                <Button
                  title="Reject Request"
                  onPress={() => rejectFriendRequest()}
                />
              </View>
            ) : user.requestSent ? (
              <Button
                title="Request Sent"
                onPress={() => recallFriendRequest()}
              />
            ) : (
              <Button title="Add user" onPress={() => sendFriendRequest()} />
            )}
          </View>
        ) : null}
        <FlatList
          ref={flatlistRef}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          data={userPosts}
          renderItem={({ item }) => (
            <PostCard isVisible={visibleItems.includes(item._id)} post={item} />
          )}
          keyExtractor={(item, index) => `${item._id}-${index}`}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
          ListHeaderComponent={() => (
            <View>
              <VideoPlayer
                // url={user.profileVideoUrl}
                // mediaHeaders={user.profileVideoHeaders}
                mediaIsSelfie
                showToggle
              />
              <Text>{user.numberOfFriends}</Text>
              <Text>
                {user.firstName} {user.lastName}
              </Text>
            </View>
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
      </SafeAreaView>
    );
  }
  return <View />;
};

export default UserProfileScreen;
