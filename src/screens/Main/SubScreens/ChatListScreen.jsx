import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import apiCall from "../../../helpers/apiCall";
import ChatCard from "../../../components/ChatCard";
import themeStyle from "../../../theme.style";
import ContentLoader from "../../../components/ContentLoader";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const navigation = useNavigation();
  const userData = useSelector((state) => state.userData);

  const { width: screenWidth } = Dimensions.get("window");

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
  }).cloneWithRows(chats);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getUserChats();
    setRefreshing(false);
  }, []);

  const rowRenderer = useCallback(
    (_, item) => (
      <ChatCard
        userId={userData.state?._id}
        chat={item}
        onPress={() =>
          navigation.navigate("ChatScreen", { existingChat: item })
        }
      />
    ),
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
          Your chats will appear here
        </Text>
        <Ionicons
          name="md-chatbox-outline"
          size={100}
          color={themeStyle.colors.grayscale.high}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate("CreateChatScreen")}
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
        <View style={{ marginLeft: 10 }}>
          <ContentLoader
            listSize={6}
            active
            showAvatar
            hideExtraText
            avatarSize={50}
          />
        </View>
      ) : null}
      {!error && chats.length ? (
        <RecyclerListView
          style={{ minHeight: 1, minWidth: 1 }}
          rowRenderer={rowRenderer}
          dataProvider={dataProvider}
          onEndReached={() => getUserChats()}
          layoutProvider={layoutProvider}
          onEndReachedThreshold={0.5}
          scrollViewProps={{
            refreshControl: (
              <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
            ),
          }}
        />
      ) : chats.length ? (
        <View />
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
