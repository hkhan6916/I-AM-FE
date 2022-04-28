import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import themeStyle from "../theme.style";
import Avatar from "./Avatar";

const ChatCard = ({ chat, onPress, userId }) => {
  const user = chat.users?.[0];
  console.log(userId, chat.upToDateUsers, user.firstName);
  return (
    <TouchableOpacity
      onPress={onPress ? () => onPress() : null}
      disabled={!onPress}
    >
      <View style={styles.container}>
        <Avatar
          preventClicks
          size={50}
          avatarUrl={user.profileGifUrl || ""}
          profileGifHeaders={user.profileGifHeaders}
        />
        <View style={styles.chatInfo}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontWeight: "600",
                fontSize: 16,
                color: themeStyle.colors.grayscale.lowest,
                flex: 1,
              }}
            >
              {user.firstName} {user.lastName}
            </Text>
            {!chat?.upToDateUsers?.includes(userId) ? (
              <View
                style={{
                  backgroundColor: themeStyle.colors.primary.default,
                  width: 20,
                  height: 20,
                  borderRadius: 20,
                }}
              />
            ) : null}
          </View>
          <Text
            style={[
              {
                color: themeStyle.colors.grayscale.low,
                marginTop: 10,
                marginRight: 20,
              },
              !chat?.upToDateUsers?.includes(userId) && {
                fontWeight: "700",
                color: themeStyle.colors.primary.default,
              },
            ]}
            numberOfLines={1}
          >
            {chat.lastMessage?.body ||
              chat.lastMessage?.mediaType?.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    borderBottomWidth: 0.5,
    borderBottomColor: themeStyle.colors.grayscale.low,
    paddingVertical: 10,
    marginHorizontal: 20,
  },
  chatInfo: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: "space-between",
  },
});

export default React.memo(ChatCard);
