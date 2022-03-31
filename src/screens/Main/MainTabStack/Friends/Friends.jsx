import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  RefreshControl,
  ScrollView,
  Text,
  FlatList,
  SectionList,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import apiCall from "../../../../helpers/apiCall";
import UserThumbnail from "../../../../components/UserThumbnail";
import themeStyle from "../../../../theme.style";

const FriendsScreen = () => {
  const [friends, setFriends] = useState([]);
  const [sections, setSections] = useState([]);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const getFriends = async () => {
    const { success, response } = await apiCall(
      "GET",
      `/user/friend/fetch/all/${friends.length}`
    );
    if (success) {
      // setFriends([...friends, ...response.friends]);
      // setRequests(response.requests);
      setSections([
        response.requests.length
          ? {
              title: "Requests",
              name: "requests",
              data: response.requests,
            }
          : { data: response.requests },
        { title: "Contacts", name: "contacts", data: response.friends },
      ]);
      setFriends([friends, ...response.friends]);
    }
  };

  const acceptFriendRequest = async (user) => {
    const { success } = await apiCall(
      "GET",
      `/user/friend/request/accept/${user}`
    );
    if (success) {
      // TODO: move accepted request to friends array
      // setSections([...sections])
    }
    return success;
  };

  const rejectFriendRequest = async (userId) => {
    const { success } = await apiCall(
      "GET",
      `/user/friend/request/reject/${userId}`
    );

    return success;
  };

  const renderItem = useCallback(
    ({ item }) => (
      <UserThumbnail
        isRequest={item.accepted === false}
        user={item}
        avatarSize={50}
        acceptFriendRequest={acceptFriendRequest}
        rejectFriendRequest={rejectFriendRequest}
      />
    ),
    []
  );

  const keyExtractor = useCallback((item, i) => item._id + i, []);

  const onRefresh = useCallback(async () => {
    await getFriends();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    (async () => {
      await getFriends();
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Button
        title="Friend Requests"
        onPress={() => navigation.navigate("FriendRequestsScreen")}
      />
      {/* <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
      />
      <FlatList
        data={friends}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={() => getFriends()}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
      /> */}
      <SectionList
        sections={sections}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
        renderSectionHeader={({ section: { title } }) => (
          <Text
            style={{
              color: themeStyle.colors.grayscale.lowest,
              margin: 10,
              fontWeight: "700",
            }}
          >
            {title}
          </Text>
        )}
        renderSectionFooter={({ section: { name } }) =>
          name === "requests" ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("FriendRequestsScreen")}
            >
              <Text
                style={{
                  color: themeStyle.colors.secondary.default,
                  textAlign: "center",
                  marginVertical: 20,
                }}
              >
                View all requests{" "}
              </Text>
            </TouchableOpacity>
          ) : null
        }
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={() => getFriends()}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default FriendsScreen;
