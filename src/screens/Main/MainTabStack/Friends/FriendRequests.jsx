import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import themeStyle from "../../../../theme.style";
import apiCall from "../../../../helpers/apiCall";
import UserThumbnail from "../../../../components/UserThumbnail";

const FriendRequestsScreen = () => {
  const [currentTab, setCurrentTab] = useState("received");
  const [friendRequestsReceived, setFriendRequestsReceived] = useState([]);
  const [friendRequestsSent, setFriendRequestsSent] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const getFriendRequests = async () => {
    const { success, response } = await apiCall("GET", "/user/friend/requests");

    if (success) {
      setFriendRequestsReceived([
        ...friendRequestsReceived,
        ...response.received,
      ]);
      setFriendRequestsSent([...friendRequestsSent, ...response.sent]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getFriendRequests();
    setRefreshing(false);
  }, []);

  const renderItem = useCallback(
    ({ item: friend }) => <UserThumbnail user={friend} avatarSize={50} />,
    [friendRequestsReceived.length, friendRequestsSent.length]
  );

  const keyExtractor = useCallback(
    (item) => item._id,
    [friendRequestsReceived.length, friendRequestsSent.length]
  );

  useEffect(() => {
    (async () => {
      await getFriendRequests();
    })();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.requestsTab,
            currentTab === "received" && styles.activeTab,
          ]}
          onPress={() => setCurrentTab("received")}
        >
          <Text
            style={[
              styles.requestsTabText,
              currentTab === "received" && {
                color: themeStyle.colors.secondary.default,
              },
            ]}
          >
            Received
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.requestsTab,
            currentTab === "sent" && styles.activeTab,
          ]}
          onPress={() => setCurrentTab("sent")}
        >
          <Text
            style={[
              styles.requestsTabText,
              currentTab === "sent" && {
                color: themeStyle.colors.secondary.default,
              },
            ]}
          >
            Sent
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={
          currentTab === "received"
            ? friendRequestsReceived
            : friendRequestsSent
        }
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={() => getFriendRequests()}
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
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: themeStyle.colors.secondary.default,
  },
  tabsContainer: {
    flexDirection: "row",
  },
  requestsTab: {
    marginHorizontal: 10,
    height: 50,
    alignSelf: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  requestsTabText: {
    fontWeight: "700",
    color: themeStyle.colors.grayscale.lowest,
  },
});

export default FriendRequestsScreen;
