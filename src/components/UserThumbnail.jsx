import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { StackActions, useNavigation } from "@react-navigation/native";
import Avatar from "./Avatar";
import themeStyle from "../theme.style";

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
      avatarUrl={user.profileGifUrl}
      profileGifHeaders={user.profileGifHeaders}
      hasBorder
      preventClicks
    />
    <View
      style={{
        justifyContent: "center",
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
            color: themeStyle.colors.grayscale.high,
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

const UserThumbnail = ({
  user,
  avatarSize,
  preventClicks,
  fontSize,
  isRequest,
  acceptFriendRequest,
  rejectFriendRequest,
}) => {
  const navigation = useNavigation();

  const handleUserProfileNavigation = () => {
    // pushes a new screen on top of the prev one to create a journey
    const pushScreen = StackActions.push("UserProfileScreen", {
      userId: user._id,
    });

    navigation.dispatch(pushScreen);
  };

  const handleReject = async () => {
    await rejectFriendRequest(user);
  };
  const handleAccept = async () => {
    await acceptFriendRequest(user);
  };

  if (!user) return <View />;
  return (
    <View>
      {!preventClicks ? (
        <TouchableOpacity
          key={user._id}
          underlayColor="gray"
          style={{ margin: 10 }}
          onPress={() => handleUserProfileNavigation()}
        >
          <Thumbnail
            avatarSize={avatarSize}
            user={user}
            navigation={navigation}
            fontSize={fontSize}
            isRequest={isRequest}
            acceptFriendRequest={acceptFriendRequest}
            rejectFriendRequest={rejectFriendRequest}
          />
        </TouchableOpacity>
      ) : (
        <Thumbnail
          avatarSize={avatarSize}
          user={user}
          navigation={navigation}
          fontSize={fontSize}
          isRequest={isRequest}
          acceptFriendRequest={handleAccept}
          rejectFriendRequest={handleReject}
        />
      )}
    </View>
  );
};

export default React.memo(UserThumbnail);
