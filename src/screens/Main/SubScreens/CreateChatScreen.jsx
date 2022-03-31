import React, { useEffect, useState, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import apiCall from "../../../helpers/apiCall";
import UserThumbnail from "../../../components/UserThumbnail";

const CreateChatScreen = () => {
  const isMounted = useRef(null);

  const [friends, setFriends] = useState([]);
  const [error, setError] = useState(false);

  const navigation = useNavigation();

  const getUserFriends = async () => {
    const { success, response } = await apiCall(
      "GET",
      `/user/friend/fetch/all/${friends.length}`
    );
    if (success) {
      setFriends([...friends, ...response.friends]);
    } else {
      setError(true);
    }
  };

  const handleChatNavigation = async (chatUserId) => {
    setError(false);
    const { response, success } = await apiCall("POST", "/chat/exists", {
      participants: [chatUserId],
    });
    if (success) {
      if (response === null) {
        navigation.navigate("ChatScreen", { chatUserId });
      } else {
        navigation.navigate("ChatScreen", { existingChat: response });
      }
    } else {
      setError(true);
    }
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  useEffect(() => {
    isMounted.current = true;
    (async () => {
      await getUserFriends();
    })();
    return () => {
      isMounted.current = false;
    };
  }, []);
  return (
    <View style={styles.container}>
      {!error ? (
        <ScrollView
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              getUserFriends();
            }
          }}
        >
          {friends.map((friend) => (
            <TouchableOpacity
              key={friend._id}
              onPress={() => handleChatNavigation(friend._id)}
            >
              <View
                style={{
                  padding: 20,
                }}
              >
                <UserThumbnail preventClicks user={friend} avatarSize={50} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
