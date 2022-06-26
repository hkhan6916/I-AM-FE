import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Dimensions,
} from "react-native";
import apiCall from "../../../helpers/apiCall";
import UserThumbnail from "../../../components/UserThumbnail";
import UserSearchBar from "../../../components/UserSearchBar";
import themeStyle from "../../../theme.style";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";
import { useSelector } from "react-redux";

const CreateChatScreen = () => {
  const isMounted = useRef(null);
  const userData = useSelector((state) => state.userData)?.state;

  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);
  const [offsets, setOffsets] = useState({});

  const data =
    searchedContacts === "none"
      ? []
      : searchedContacts?.length
      ? searchedContacts
      : contacts;

  const navigation = useNavigation();

  const { width: screenWidth } = Dimensions.get("window");

  const getUserContacts = async () => {
    const { success, response } = await apiCall(
      "POST",
      `/user/friend/fetch/all`,
      offsets
    );
    const { friendsAsSenderOffset, friendsAsReceiverOffset } = response;
    setOffsets({ friendsAsSenderOffset, friendsAsReceiverOffset });
    if (success) {
      setContacts([...contacts, ...response.friends]); // TODO: rename to contacts in BE
    } else {
      setError(true);
    }
  };

  const handleChatNavigation = async (chatUserId, chatUserFirstName) => {
    setError(false);
    const { response, success, message } = await apiCall(
      "POST",
      "/chat/exists",
      {
        participants: [chatUserId],
      }
    );
    if (success) {
      if (response === null) {
        navigation.navigate("ChatScreen", { chatUserId, chatUserFirstName });
      } else {
        navigation.navigate("ChatScreen", { existingChat: response });
      }
    } else {
      setError(true);
    }
  };

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
  }).cloneWithRows(data);

  const renderItem = useCallback(
    ({ item: contact }) => (
      <TouchableOpacity
        onPress={() => handleChatNavigation(contact._id, contact.firstName)}
      >
        <View
          style={{
            padding: 20,
          }}
        >
          <UserThumbnail preventClicks user={contact} avatarSize={50} />
        </View>
      </TouchableOpacity>
    ),
    [contacts]
  );

  const rowRenderer = useCallback(
    (_, item) => (
      <TouchableOpacity
        onPress={() => handleChatNavigation(item._id, item.firstName)}
      >
        <UserThumbnail preventClicks user={item} avatarSize={50} />
      </TouchableOpacity>
    ),
    [contacts]
  );

  const keyExtractor = useCallback((item, i) => item._id, [contacts]);
  useEffect(() => {
    isMounted.current = true;
    (async () => {
      if (userData?.profileVideoUrl) {
        await getUserContacts();
      }
    })();
    return () => {
      isMounted.current = false;
    };
  }, []);
  return (
    <View style={styles.container}>
      <UserSearchBar // TODO: This only searches in the data provided. Users will expect all contacts to be shared not just the current ones loaded. Need to make this call an endpoint possibly
        setResults={setSearchedContacts}
        onSubmitEditing={() => Keyboard.dismiss()}
        customSearch
      />

      {!error && data?.length ? (
        <RecyclerListView
          style={{ minHeight: 1, minWidth: 1 }}
          rowRenderer={rowRenderer}
          dataProvider={dataProvider}
          onEndReached={() => getUserContacts()}
          layoutProvider={layoutProvider}
          onEndReachedThreshold={0.5}
        />
      ) : error ? (
        <View>
          <Text
            style={{
              textAlign: "center",
              color: themeStyle.colors.grayscale.lowest,
            }}
          >
            Something went wrong, please try again later.
          </Text>
        </View>
      ) : (
        <View />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CreateChatScreen;
