import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import apiCall from "../../../helpers/apiCall";
import ChatCard from "../../../components/ChatCard";
import themeStyle from "../../../theme.style";
import ContentLoader from "../../../components/ContentLoader";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const navigation = useNavigation();
  const userData = useSelector((state) => state.userData);

  const getUserChats = async () => {
    const { response, success } = await apiCall(
      "GET",
      `/user/chats/${chats.length}`
    );
    setError(false);
    if (success) {
      setChats([...chats, ...response]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getUserChats();
    setRefreshing(false);
  }, []);

  const renderItem = useCallback(
    ({ item: chat }) => (
      <ChatCard
        userId={userData.state?._id}
        chat={chat}
        onPress={() =>
          navigation.navigate("ChatScreen", { existingChat: chat })
        }
      />
    ),
    [chats.length]
  );

  const keyExtractor = useCallback(
    (item, i) => `${item._id}-${i}`,
    [chats.length]
  );

  useEffect(() => {
    const focusListener = navigation.addListener("focus", async () => {
      await getUserChats();
      setLoaded(true);
    });

    return () => {
      navigation.removeListener(focusListener);
    };
  }, [navigation]);
  if (loaded && !chats.length) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text
          style={{
            color: themeStyle.colors.grayscale.lowest,
            textAlign: "center",
            fontSize: 20,
            marginHorizontal: 10,
            marginBottom: 20,
          }}
        >
          All your chats will be here
        </Text>
        <Ionicons
          name="md-chatbox-outline"
          size={100}
          color={themeStyle.colors.grayscale.high}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate("Friends")}
          style={{ marginTop: 50 }}
        >
          <View
            style={{
              paddingVertical: 5,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: themeStyle.colors.secondary.default,
              borderRadius: 5,
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                color: themeStyle.colors.grayscale.lowest,
              }}
            >
              Create a chat
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {!loaded && !error ? (
        <View>
          <ContentLoader
            listSize={6}
            active
            showAvatar
            hideExtraText
            avatarSize={50}
          />
        </View>
      ) : null}
      {!error ? (
        <FlatList
          data={chats}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
          contentContainerStyle={{ flexGrow: 1 }}
          onEndReached={() => getUserChats()}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
        />
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
            color={themeStyle.colors.grayscale.lowest}
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
