import React from "react";
import { View, TouchableOpacity } from "react-native";
import { StackActions, useNavigation } from "@react-navigation/native";
import Thumbnail from "./Thumbnail";
import themeStyle from "../../theme.style";

const UserThumbnail = ({
  user,
  avatarSize,
  preventClicks,
  fontSize,
  isRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  showSeparator,
  height,
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
    <View
      style={{
        height: height || 80,
        paddingHorizontal: 10,
      }}
    >
      <View
        style={{
          borderBottomWidth: showSeparator ? 1 : 0,
          height: "100%",
          justifyContent: "center",
          borderColor: themeStyle.colors.grayscale.high,
        }}
      >
        {!preventClicks ? (
          <TouchableOpacity
            key={user._id}
            underlayColor="gray"
            // style={{ margin: 10 }}
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
    </View>
  );
};

export default React.memo(UserThumbnail);
