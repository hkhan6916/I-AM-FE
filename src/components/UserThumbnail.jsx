import React from "react";
import { View, Text, TouchableHighlight, TouchableOpacity } from "react-native";
import { StackActions, useNavigation } from "@react-navigation/native";
import Avatar from "./Avatar";
import themeStyle from "../theme.style";

const Thumbnail = ({ avatarSize, user, navigation, fontSize }) => (
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
  </View>
);

const UserThumbnail = ({ user, avatarSize, preventClicks, fontSize }) => {
  const navigation = useNavigation();

  const handleUserProfileNavigation = () => {
    // pushes a new screen on top of the prev one to create a journey
    const pushScreen = StackActions.push("UserProfileScreen", {
      userId: user._id,
    });

    navigation.dispatch(pushScreen);
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
          />
        </TouchableOpacity>
      ) : (
        <Thumbnail />
      )}
    </View>
  );
};

export default React.memo(UserThumbnail);
