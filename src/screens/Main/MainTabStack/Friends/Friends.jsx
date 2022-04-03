import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  RefreshControl,
  Text,
  SectionList,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import apiCall from "../../../../helpers/apiCall";
import UserThumbnail from "../../../../components/UserThumbnail";
import themeStyle from "../../../../theme.style";
import UserSearchBar from "../../../../components/UserSearchBar";
const FriendsScreen = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sections, setSections] = useState([]);
  const [searchedFriends, setSearchedFriends] = useState([]);

  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const getFriends = async () => {
    const { success, response } = await apiCall(
      "GET",
      `/user/friend/fetch/all/${friends.length}`
    );
    if (success) {
      setSections([
        response.requests.length
          ? {
              title: "Requests received",
              name: "requests",
              data: response.requests,
            }
          : { data: response.requests },
        { title: "My contacts", name: "contacts", data: response.friends },
      ]);
      setFriends([...friends, ...response.friends]);
      setRequests([...requests, ...response.requests]);
    }
  };

  const handleSearch = (result) => {
    const updatedSections = [
      sections[0],
      {
        ...sections[1],
        data: result === "none" ? [] : result?.length ? result : friends,
      },
    ];

    setSections(updatedSections);
  };

  const acceptFriendRequest = async (user) => {
    const { success } = await apiCall(
      "GET",
      `/user/friend/request/accept/${user._id}`
    );
    if (success) {
      const index = sections[0].data.map((e) => e._id).indexOf(user._id);

      const updatedSections = [
        sections[0].data?.length - 1 !== 0
          ? { ...sections[0], data: [...sections[0].data.splice(index, 1)] }
          : { name: "", data: [] },
        {
          ...sections[1],
          data: [...sections[1].data, { ...user, accepted: true }],
        },
      ];
      setSections(updatedSections);
    }
    return true;
  };

  const rejectFriendRequest = async (user) => {
    const { success } = await apiCall(
      "GET",
      `/user/friend/request/reject/${user._id}`
    );
    if (success) {
      const index = sections[0].data.map((e) => e._id).indexOf(user._id);
      const updatedSections = [
        sections[0].data?.length - 1 !== 0
          ? { ...sections[0], data: [...sections[0].data.splice(index, 1)] }
          : { name: "", data: [] },
        sections[1],
      ];
      setSections(updatedSections);
    }

    return true;
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
    [sections[0]?.data?.length, sections[1]?.data?.length]
  );
  const keyExtractor = useCallback((item, i) => item._id + i, [sections]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getFriends();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    (async () => {
      setRefreshing(true);
      await getFriends();
      setRefreshing(false);
    })();
  }, []);
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{
          alignSelf: "flex-end",
          marginHorizontal: 20,
          marginTop: 20,
          marginBottom: 10,
        }}
        onPress={() => navigation.navigate("FriendRequestsScreen")}
      >
        <Text
          style={{
            color: themeStyle.colors.secondary.default,
            fontSize: 16,
            fontWeight: "700",
          }}
        >
          All requests
        </Text>
      </TouchableOpacity>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
        renderSectionHeader={({ section: { title, name } }) =>
          title && (
            <View>
              <Text
                style={{
                  color: themeStyle.colors.grayscale.lowest,
                  marginVertical: 10,
                  marginHorizontal: 10,
                  fontWeight: "700",
                }}
              >
                {title}
              </Text>
              {name === "contacts" ? (
                <UserSearchBar
                  setResults={handleSearch}
                  dataToSearchWithin={friends}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              ) : null}
            </View>
          )
        }
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
                View all requests
              </Text>
            </TouchableOpacity>
          ) : null
        }
        contentContainerStyle={{ flexGrow: 1 }}
        // onEndReached={() => getFriends()}
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
