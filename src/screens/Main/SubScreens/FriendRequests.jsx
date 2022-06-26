import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import themeStyle from "../../../theme.style";
import apiCall from "../../../helpers/apiCall";
import UserThumbnail from "../../../components/UserThumbnail";

const FriendRequestsScreen = () => {
  const [currentTab, setCurrentTab] = useState("received");
  const [friendRequestsReceived, setFriendRequestsReceived] = useState([]);
  const [friendRequestsSent, setFriendRequestsSent] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const navigation = useNavigation();

  const getFriendRequests = async () => {
    if (allLoaded) return;
    const { success, response } = await apiCall(
      "POST",
      "/user/friend/requests",
      {
        sentOffset: friendRequestsSent?.length,
        receivedOffset: friendRequestsReceived?.length,
      }
    );
    if (success) {
      if (!response.received?.length && !response.sent?.length) {
        setAllLoaded(true);
        return;
      }
      setFriendRequestsReceived([
        ...friendRequestsReceived,
        ...response.received,
      ]);
      setFriendRequestsSent([...friendRequestsSent, ...response.sent]);
    }
  };

  const onRefresh = useCallback(async () => {
    setAllLoaded(false);
    await getFriendRequests();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    navigation.addListener("focus", async () => {
      await getFriendRequests();
    });
    return () => {
      setFriendRequestsReceived([]);
      setFriendRequestsSent([]);
    };
  }, [navigation]);

  useEffect(() => {
    (async () => {
      await getFriendRequests();
    })();
    return () => {
      setFriendRequestsReceived([]);
      setFriendRequestsSent([]);
    };
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.requestsTab,
            currentTab === "received" && styles.activeTab,
          ]}
          onPress={() => setCurrentTab("received")}
        >
          <Text style={styles.requestsTabText}>Received</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.requestsTab,
            currentTab === "sent" && styles.activeTab,
          ]}
          onPress={() => setCurrentTab("sent")}
        >
          <Text style={styles.requestsTabText}>Sent</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
      >
        {currentTab === "received"
          ? friendRequestsReceived.map((received) => (
              <UserThumbnail key={received._id} user={received} />
            ))
          : friendRequestsSent.map((sent) => (
              <UserThumbnail key={sent._id} user={sent} />
            ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: themeStyle.colors.secondary.default,
  },
  tabsContainer: {
    flexDirection: "row",
    marginTop: 10,
    backgroundColor: themeStyle.colors.grayscale.low,
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
  },
});

export default FriendRequestsScreen;
