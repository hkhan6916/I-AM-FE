import React from "react";
import { View, Text, TouchableHighlight } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Avatar from "./Avatar";
import themeStyle from "../theme.style";
import { StackActions } from "@react-navigation/native";

const UserThumbnail = ({ user, avatarSize, preventClicks }) => {
  const navigation = useNavigation();
  const handleUserProfileNavigation = () => {
    // pushes a new screen on top of the prev one to create a journey
    const pushScreen = StackActions.push("UserProfileScreen", {
      userId: user._id,
    });

    navigation.dispatch(pushScreen);
  };
  const Thumbnail = () => (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      <Avatar
        navigation={navigation}
        size={avatarSize}
        avatarUrl={user.profileGifUrl}
        profileGifHeaders={user.profileGifHeaders}
        hasBorder
      />
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          marginLeft: 20,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            fontWeight: "700",
            maxWidth: 200,
            color: themeStyle.colors.grayscale.lowest,
          }}
        >
          {user.username}
        </Text>
        <Text
          style={{ maxWidth: 200, color: themeStyle.colors.grayscale.lowest }}
          numberOfLines={1}
        >
          {user.firstName} {user.lastName}
        </Text>
        {user.jobTitle && (
          <Text
            numberOfLines={1}
            style={{
              color: themeStyle.colors.grayscale.high,
              maxWidth: 200,
            }}
          >
            {user.jobTitle}
          </Text>
        )}
      </View>
    </View>
  );
  return (
    <View>
      {!preventClicks ? (
        <TouchableHighlight
          key={user._id}
          underlayColor="gray"
          style={{ margin: 10 }}
          onPress={() => handleUserProfileNavigation()}
        >
          <Thumbnail />
        </TouchableHighlight>
      ) : (
        <Thumbnail />
      )}
    </View>
  );
};

export default UserThumbnail;
