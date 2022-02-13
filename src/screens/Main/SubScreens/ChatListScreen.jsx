import React, { useEffect, useState, useRef } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import apiCall from "../../../helpers/apiCall";
import ChatCard from "../../../components/ChatCard";
import themeStyle from "../../../theme.style";

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState(false);
  const isMounted = useRef(null);

  const navigation = useNavigation();

  const getUserChats = async () => {
    const { response, success } = await apiCall(
      "GET",
      `/user/chats/${chats.length}`
    );
    if (isMounted.current) {
      setError(false);
      if (success) {
        setChats(response);
      } else if (isMounted.current) {
        setError(true);
      }
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
      await getUserChats();
    })();
    navigation.addListener("focus", async () => {
      await getUserChats();
    });

    return () => {
      isMounted.current = false;
    };
  }, [navigation]);
  return (
    <View style={styles.container}>
      {!error ? (
        <ScrollView
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              getUserChats();
            }
          }}
        >
          {chats.length
            ? chats.map((chat) => (
                <TouchableOpacity
                  key={chat._id}
                  onPress={() =>
                    navigation.navigate("ChatScreen", { existingChat: chat })
                  }
                >
                  <View>
                    {chat.users.length ? <ChatCard chat={chat} /> : null}
                  </View>
                </TouchableOpacity>
              ))
            : null}
        </ScrollView>
      ) : (
        <View>
          <Text>Oops, something went wrong</Text>
        </View>
      )}
      <View
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          borderRadius: 100,
          borderWidth: 2,
          borderColor: themeStyle.colors.primary.default,
        }}
      >
        <TouchableOpacity
          style={{
            height: 60,
            width: 60,
            zIndex: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => navigation.navigate("CreateChatScreen")}
        >
          <Entypo
            name="new-message"
            size={24}
            color={themeStyle.colors.grayscale.darkGray}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatListScreen;
