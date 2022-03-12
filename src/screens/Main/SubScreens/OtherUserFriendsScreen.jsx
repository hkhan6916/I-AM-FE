import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from "react-native";
import apiCall from "../../../helpers/apiCall";
import UserThumbnail from "../../../components/UserThumbnail";
import { useNavigation } from "@react-navigation/native";
import themeStyle from "../../../theme.style";
import SearchBar from "../../../components/SearchBar";

const OtherUserFriendsScreen = (props) => {
  const { userId, firstName } = props.route.params;
  const [friends, setFriends] = useState([]);
  const [searchedFriends, setSearchedFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const getFriends = async () => {
    const { success, response } = await apiCall(
      "GET",
      `/user/${userId}/friend/fetch/all/${friends.length}`
    );

    if (success) {
      setFriends([...friends, ...response]);
    }
  };

  const onRefresh = useCallback(async () => {
    await getFriends();
    setRefreshing(false);
  }, []);

  const renderItem = useCallback(
    ({ item }) => <UserThumbnail user={item} avatarSize={50} />,
    []
  );

  const listFooterComponent = useCallback(
    () => (
      <ActivityIndicator
        size={"large"}
        color={themeStyle.colors.primary.default}
        animating={loading}
      />
    ),
    [loading]
  );

  const keyExtractor = useCallback((item) => item._id, []);

  useEffect(() => {
    navigation.setOptions({
      title: firstName ? `${firstName}'s contacts` : "",
    });
    (async () => {
      await getFriends();
    })();
  }, []);

  return (
    <View style={styles.container}>
      <SearchBar
        setResults={setSearchedFriends}
        contactName={firstName}
        dataToSearchWithin={friends}
      />
      <FlatList
        data={
          searchedFriends === "none"
            ? []
            : searchedFriends?.length
            ? searchedFriends
            : friends
        }
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
        ListFooterComponent={listFooterComponent}
        onEndReached={() => getFriends()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OtherUserFriendsScreen;
