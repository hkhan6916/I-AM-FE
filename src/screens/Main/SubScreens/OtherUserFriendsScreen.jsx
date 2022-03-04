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
const OtherUserFriendsScreen = (props) => {
  const { userId, firstName } = props.route.params;
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const getFriends = async () => {
    setLoading(true);
    const { success, response } = await apiCall(
      "GET",
      `/user/${userId}/friend/fetch/all/${friends.length}`
    );
    setLoading(false);

    if (success) {
      setFriends(response);
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
      <FlatList
        data={friends}
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
