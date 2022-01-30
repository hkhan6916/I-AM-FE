import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import apiCall from "../../../helpers/apiCall";
import VideoPlayer from "../../../components/VideoPlayer";
import { useNavigation } from "@react-navigation/native";
import themeStyle from "../../../theme.style";
import PostCard from "../../../components/PostCard";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const UserProfileScreen = (props) => {
  const { userId } = props.route.params;
  const [user, setUser] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);

  const navigation = useNavigation();

  const flatlistRef = useRef(null);

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

    const { success, error, message, response } = await apiCall(
      "GET",
      `/user/friend/remove/${userId}`
    );
    console.log(message, response);
    if (!success || error === "CONNECTION_FAILED") {
      const userIsFriend = { ...user, isFriend: true, requestReceived: false };

      setUser(userIsFriend);
    }
  };

  const getUserPosts = async () => {
    if (!allPostsLoaded) {
      const { success, response } = await apiCall(
        "GET",
        `/user/${userId}/posts/${userPosts.length}`
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
      `/user/${userId}/posts/${userPosts.length}`
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
          navigation.setOptions({
            title: `${response.otherUser.firstName} ${response.otherUser.lastName}`,
          });
          if (!response.otherUser?.private) {
            await getUserPosts();
          }
        }
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
            <View style={{ marginBottom: 10 }}>
              <LinearGradient
                start={[0, 0.5]}
                end={[1, 0.5]}
                style={{ padding: 4 }}
                colors={[
                  themeStyle.colors.grayscale.white,
                  themeStyle.colors.primary.light,
                ]}
              >
                <VideoPlayer
                  // url={user.profileVideoUrl}
                  // mediaHeaders={user.profileVideoHeaders}
                  mediaIsSelfie
                  showToggle
                />
              </LinearGradient>
              <View style={{ padding: 5 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text>
                    {user.firstName} {user.lastName}
                  </Text>
                  {user.private && !user.isFriend ? (
                    <View
                      style={{
                        borderWidth: 1,
                        alignSelf: "flex-start",
                        paddingVertical: 2,
                        paddingHorizontal: 5,
                        borderRadius: 5,
                        marginLeft: 20,
                        borderColor: themeStyle.colors.secondary.default,
                      }}
                    >
                      <Text>private</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={{ marginVertical: 20 }}>
                  {user.numberOfFriends} contacts
                </Text>
                {!user.isSameUser ? (
                  <View style={{ alignItems: "center" }}>
                    {user.isFriend ? (
                      <TouchableOpacity onPress={() => removeConnection()}>
                        <View
                          style={{
                            borderColor: themeStyle.colors.primary.default,
                            borderWidth: 1,
                            padding: 10,
                            borderRadius: 5,
                          }}
                        >
                          <Text style={{ fontWeight: "700" }}>
                            Remove Contact
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : user.requestReceived ? (
                      <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                          style={{ marginHorizontal: 10 }}
                          onPress={() => acceptFriendRequest()}
                        >
                          <View
                            style={{
                              borderColor: themeStyle.colors.success.default,
                              borderWidth: 1,
                              padding: 10,
                              borderRadius: 5,
                              alignItems: "center",
                              justifyContent: "center",
                              marginHorizontal: 10,
                              flexDirection: "row",
                            }}
                          >
                            <AntDesign name="check" size={20} color="black" />
                            <Text style={{ fontWeight: "700" }}>Accept</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ marginHorizontal: 10 }}
                          onPress={() => rejectFriendRequest()}
                        >
                          <View
                            style={{
                              borderColor: themeStyle.colors.grayscale.black,
                              borderWidth: 1,
                              padding: 10,
                              borderRadius: 5,
                              alignItems: "center",
                              justifyContent: "center",
                              marginHorizontal: 10,
                              flexDirection: "row",
                            }}
                          >
                            <AntDesign name="close" size={20} color="black" />
                            <Text style={{ fontWeight: "700" }}>Delete</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    ) : user.requestSent ? (
                      <TouchableOpacity onPress={() => recallFriendRequest()}>
                        <View
                          style={{
                            borderColor: themeStyle.colors.primary.default,
                            borderWidth: 1,
                            padding: 10,
                            borderRadius: 5,
                          }}
                        >
                          <Text
                            style={{ fontWeight: "700", textAlign: "center" }}
                          >
                            Request sent
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => sendFriendRequest()}>
                        <View
                          style={{
                            borderColor: themeStyle.colors.primary.default,
                            borderWidth: 1,
                            padding: 10,
                            borderRadius: 5,
                            flexDirection: "row",
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: "700",
                            }}
                          >
                            Add User
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : null}
              </View>
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
