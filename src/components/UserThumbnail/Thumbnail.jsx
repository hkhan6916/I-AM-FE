import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Avatar from "../Avatar";
import themeStyle from "../../theme.style";

const Thumbnail = ({
  avatarSize,
  user,
  navigation,
  fontSize,
  isRequest,
  acceptFriendRequest,
  rejectFriendRequest,
}) => (
  <View
    style={{
      flexDirection: "row",
      flexWrap: "wrap",
    }}
  >
    <Avatar
      navigation={navigation}
      size={avatarSize}
      avatarUrl={user.profileGifUrl || user.profileImageUrl}
      hasBorder={!!user.profileGifUrl}
      profileGifHeaders={user.profileGifHeaders}
      profileImageHeaders={user.profileImageHeaders}
      preventClicks
      flipProfileVideo={user?.flipProfileVideo}
    />
    <View
      style={{
        justifyContent: "space-around",
        marginLeft: 20,
        flex: 1,
        paddingRight: 10,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          fontWeight: "700",
          maxWidth: 200,
          color: themeStyle.colors.grayscale.lowest,
          fontSize: fontSize || 14,
        }}
      >
        {user.username}
      </Text>
      <Text
        style={{
          maxWidth: 200,
          color: themeStyle.colors.grayscale.lowest,
          fontSize: fontSize || 14,
        }}
        numberOfLines={1}
      >
        {user.firstName} {user.lastName}
      </Text>
      {user.jobTitle && (
        <Text
          numberOfLines={1}
          style={{
            color: themeStyle.colors.grayscale.low,
            maxWidth: 200,
            fontSize: fontSize || 14,
          }}
        >
          {user.jobTitle}
        </Text>
      )}
    </View>
    {isRequest ? (
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => rejectFriendRequest(user)}
          style={{
            marginHorizontal: 10,
            borderWidth: 1,
            borderColor: themeStyle.colors.grayscale.lowest,
            padding: 2,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: themeStyle.colors.white }}>Remove</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => acceptFriendRequest(user)}
          style={{
            marginHorizontal: 10,
            backgroundColor: themeStyle.colors.secondary.default,
            paddingVertical: 2,
            paddingHorizontal: 10,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: themeStyle.colors.white }}>Add</Text>
        </TouchableOpacity>
      </View>
    ) : null}
  </View>
);

export default React.memo(Thumbnail);
