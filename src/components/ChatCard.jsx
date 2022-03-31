import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import themeStyle from "../theme.style";
import Avatar from "./Avatar";

const ChatCard = ({ chat, onPress }) => {
  const user = chat.users?.[0];

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
          <Text
            numberOfLines={1}
            style={{
              fontWeight: "600",
              fontSize: 16,
              color: themeStyle.colors.grayscale.lowest,
            }}
          >
            {user.firstName} {user.lastName}
          </Text>
          <Text
            style={{ color: themeStyle.colors.grayscale.lowest }}
            numberOfLines={1}
          >
            {chat.previewMessage}
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
  },
});

export default ChatCard;
