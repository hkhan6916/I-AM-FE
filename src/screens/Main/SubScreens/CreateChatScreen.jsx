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
} from "react-native";
import apiCall from "../../../helpers/apiCall";
import UserThumbnail from "../../../components/UserThumbnail";
import UserSearchBar from "../../../components/UserSearchBar";
const CreateChatScreen = () => {
  const isMounted = useRef(null);

  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);
  const [offsets, setOffsets] = useState({});

  const navigation = useNavigation();

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
    const { response, success } = await apiCall("POST", "/chat/exists", {
      participants: [chatUserId],
    });
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

  const keyExtractor = useCallback((item, i) => item._id, [contacts]);
  useEffect(() => {
    isMounted.current = true;
    (async () => {
      await getUserContacts();
    })();
    return () => {
      isMounted.current = false;
    };
  }, []);
  return (
    <View style={styles.container}>
      <UserSearchBar
        setResults={setSearchedContacts}
        dataToSearchWithin={contacts}
        onSubmitEditing={() => Keyboard.dismiss()}
      />

      {!error ? (
        <FlatList
          data={
            searchedContacts === "none"
              ? []
              : searchedContacts?.length
              ? searchedContacts
              : contacts
          }
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          keyboardShouldPersistTaps={"always"}
          onEndReached={() => getUserContacts()}
          // onEndReachedThreshold={0.5}
        />
      ) : (
        <View>
          <Text>Oops, something went wrong</Text>
        </View>
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
