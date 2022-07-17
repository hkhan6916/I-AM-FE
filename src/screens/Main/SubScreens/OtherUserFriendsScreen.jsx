import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  RefreshControl,
  Keyboard,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import apiCall from "../../../helpers/apiCall";
import UserThumbnail from "../../../components/UserThumbnail";
import { useNavigation } from "@react-navigation/native";
import UserSearchBar from "../../../components/UserSearchBar";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";
import { useSelector } from "react-redux";
import themeStyle from "../../../theme.style";
import { ScrollView } from "react-native-gesture-handler";

const OtherUserFriendsScreen = (props) => {
  const { userId, firstName } = props.route.params;
  const [friends, setFriends] = useState([]);
  const [searchedFriends, setSearchedFriends] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const userData = useSelector((state) => state.userData)?.state;
  const { width: screenWidth } = Dimensions.get("window");
  const data =
    searchedFriends === "none"
      ? []
      : searchedFriends?.length
      ? searchedFriends
      : friends;
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

  const layoutProvider = useRef(
    new LayoutProvider(
      () => 0,
      (_, dim) => {
        dim.width = screenWidth;
        dim.height = 70;
      }
    )
  ).current;

  let dataProvider = new DataProvider((r1, r2) => {
    return r1._id !== r2._id;
  }).cloneWithRows(data);

  const rowRenderer = useCallback(
    (_, item) => <UserThumbnail user={item} avatarSize={50} />,
    []
  );

  useEffect(() => {
    navigation.setOptions({
      title:
        firstName && userId !== userData?._id
          ? `${firstName}'s contacts`
          : "Contacts",
    });
    (async () => {
      setLoading(Platform.OS === "ios");
      setRefreshing(Platform.OS === "android");
      await getFriends();
      setLoading(false);
      setRefreshing(false);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <UserSearchBar
        setResults={setSearchedFriends}
        contactName={firstName}
        customSearch
        apiRoute={`/user/friends/search/0`}
        apiConfig={{ userId }}
        onSubmitEditing={() => Keyboard.dismiss()}
        placeholder={`Search ${
          firstName && userId !== userData?._id
            ? `${firstName}'s contacts`
            : "contacts"
        }`}
      />
      {data?.length ? (
        <RecyclerListView
          style={{ minHeight: 1, minWidth: 1 }}
          rowRenderer={rowRenderer}
          dataProvider={dataProvider}
          onEndReached={() => getFriends()}
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
            animating={loading}
          />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.colors.grayscale.highest,
  },
});

export default OtherUserFriendsScreen;
