import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import themeStyle from "../../../../theme.style";
import apiCall from "../../../../helpers/apiCall";
import UserThumbnail from "../../../../components/UserThumbnail";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";
import { ScrollView } from "react-native-gesture-handler";

const FriendRequestsScreen = () => {
  const [currentTab, setCurrentTab] = useState("received");
  const [friendRequestsReceived, setFriendRequestsReceived] = useState([]);
  const [friendRequestsSent, setFriendRequestsSent] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { width: screenWidth } = Dimensions.get("window");

  const getFriendRequests = async () => {
    const { success, response } = await apiCall(
      "POST",
      "/user/friend/requests",
      {
        sentOffset: friendRequestsSent?.length,
        receivedOffset: friendRequestsReceived?.length,
      }
    );

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
  const rowRenderer = useCallback(
    (_, item) => <UserThumbnail user={item} avatarSize={50} />,
    [friendRequestsReceived.length, friendRequestsSent.length]
  );

  const layoutProvider = useRef(
    new LayoutProvider(
      () => 0,
      (_, dim) => {
        dim.width = screenWidth;
        dim.height = 80;
      }
    )
  ).current;

  let dataProvider = new DataProvider((r1, r2) => {
    return r1._id !== r2._id;
  }).cloneWithRows(
    currentTab === "received" ? friendRequestsReceived : friendRequestsSent
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      setRefreshing(true);
      await getFriendRequests();
      setRefreshing(false);
      setLoading(false);
    })();
  }, []);

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

      {(friendRequestsReceived.length && currentTab === "received") ||
      (friendRequestsSent.length && currentTab === "sent") ? (
        <RecyclerListView
          style={{ minHeight: 1, minWidth: 1 }}
          rowRenderer={rowRenderer}
          dataProvider={dataProvider}
          onEndReached={() => getFriendRequests()}
          layoutProvider={layoutProvider}
          onEndReachedThreshold={0.5}
          scrollViewProps={{
            refreshControl: (
              <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
            ),
          }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
        >
          <ActivityIndicator
            size={"small"}
            color={themeStyle.colors.grayscale.low}
            animating={Platform.OS === "ios" ? loading : false}
          />
        </ScrollView>
      )}
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
