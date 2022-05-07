import React, { useState } from "react";
import { AntDesign, Entypo } from "@expo/vector-icons";
import VideoPlayer from "./VideoPlayer";
import themeStyle from "../theme.style";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";
import PreviewVideo from "./PreviewVideo";
import { StackActions, useNavigation } from "@react-navigation/native";
import apiCall from "../helpers/apiCall";
import UserOptionsModal from "./UserOptionsModal";

const ProfileInfo = ({
  user,
  sendFriendRequest,
  recallFriendRequest,
  rejectFriendRequest,
  removeConnection,
  acceptFriendRequest,
}) => {
  const [showUserOptions, setShowUserOptions] = useState(false);
  const [reportError, setReportError] = useState("");
  const navigation = useNavigation();

  const handleUserFriendsNavigation = () => {
    // pushes a new screen on top of the prev one to create a journey
    const pushScreen = StackActions.push("OtherUserFriendsScreen", {
      userId: user?._id,
      firstName: user?.firstName,
    });

    navigation.dispatch(pushScreen);
  };
  const handleChatNavigation = async () => {
    const { response, success } = await apiCall("POST", "/chat/exists", {
      participants: [user._id],
    });
    if (success) {
      if (response === null) {
        navigation.navigate("ChatScreen", {
          chatUserId: user._id,
          chatUserFirstName: user.firstName,
        });
      } else {
        navigation.navigate("ChatScreen", { existingChat: response });
      }
    }
  };
  const reportUser = async (reason) => {
    const { success } = await apiCall("POST", "/user/report", {
      reason,
      userToReport: user._id,
    });
    if (success) {
      setShowUserOptions(false);
    } else {
      setReportError(
        "There was an issue reporting this user. Please try again later."
      );
    }
  };
  if (!user) {
    return <View />;
  }
  return (
    <View>
      <UserOptionsModal
        reportUser={reportUser}
        showOptions={showUserOptions}
        setShowUserOptions={(value) => {
          setShowUserOptions(value);
          setReportError("");
        }}
        error={reportError}
        onHide={() => setReportError("")}
        user={user}
        removeConnection={removeConnection}
      />
      <PreviewVideo
        uri={user.profileVideoUrl}
        isFullWidth
        previewText={"Tap to play"}
      />
      {!user.isSameUser ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <TouchableOpacity
            disabled={user.private && !user.isFriend}
            onPress={() => handleChatNavigation()}
            style={{ flex: 1 }}
          >
            <View
              style={{
                borderColor: themeStyle.colors.grayscale.lowest,
                borderWidth: 1,
                padding: 10,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                opacity: user.private && !user.isFriend ? 0.5 : 1,
                width: "100%",
              }}
            >
              {user.private && !user.isFriend ? (
                <AntDesign
                  name="lock"
                  size={16}
                  color={themeStyle.colors.grayscale.lowest}
                />
              ) : (
                <Ionicons
                  name="paper-plane-outline"
                  size={16}
                  color={themeStyle.colors.grayscale.lowest}
                />
              )}
              <Text
                style={{
                  color: themeStyle.colors.grayscale.lowest,
                  textAlign: "center",
                }}
              >
                {" "}
                Message
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowUserOptions(true)}
            style={{
              height: 40,
              width: 40,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: themeStyle.colors.grayscale.lowest,
              borderRadius: 100,
              marginLeft: 5,
            }}
          >
            <Entypo
              name="dots-three-vertical"
              size={16}
              color={themeStyle.colors.grayscale.highest}
            />
          </TouchableOpacity>
        </View>
      ) : null}
      {user.isSameUser ? (
        <Text
          style={{
            color: themeStyle.colors.grayscale.lowest,
            textAlign: "center",
          }}
        >
          Viewing your public profile.
        </Text>
      ) : null}
      <View style={{ padding: 5, marginTop: 10 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              color: themeStyle.colors.grayscale.lowest,
            }}
          >
            {user.username}
            {"  "}
            {user.private && !user.isFriend ? (
              <AntDesign
                name="lock"
                size={16}
                color={themeStyle.colors.grayscale.lower}
              />
            ) : user.isFriend ? (
              <Feather
                name="user-check"
                size={16}
                color={themeStyle.colors.grayscale.lowest}
              />
            ) : null}
          </Text>
        </View>
        {user.jobTitle ? (
          <Text
            style={{ color: themeStyle.colors.grayscale.lowest, marginTop: 10 }}
          >
            {user.jobTitle}
          </Text>
        ) : null}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 20,
          }}
        >
          <Ionicons
            name="people"
            size={24}
            color={themeStyle.colors.grayscale.lower}
          />
          {(user.private && user.isFriend) ||
          !user.private ||
          user.isSameUser ? (
            <TouchableOpacity onPress={() => handleUserFriendsNavigation()}>
              <Text
                style={{
                  marginHorizontal: 10,
                  color: themeStyle.colors.primary.default,
                  fontWeight: "700",
                }}
              >
                {user.numberOfFriends} contacts
              </Text>
            </TouchableOpacity>
          ) : (
            <Text
              style={{
                marginHorizontal: 10,
                color: themeStyle.colors.grayscale.lowest,
              }}
            >
              {user.numberOfFriends} contacts
            </Text>
          )}
        </View>

        {!user.isSameUser && !user.isFriend ? (
          <View>
            {user.requestReceived ? (
              <View style={{ flexDirection: "column", paddingHorizontal: 20 }}>
                <Text
                  style={{
                    color: themeStyle.colors.grayscale.lowest,
                    fontWeight: "700",
                  }}
                >
                  I would like to add you as a contact
                </Text>
                <TouchableOpacity
                  style={{ marginVertical: 10 }}
                  onPress={() => acceptFriendRequest()}
                >
                  <View
                    style={{
                      borderColor: themeStyle.colors.success.default,
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                    }}
                  >
                    <AntDesign
                      name="check"
                      size={20}
                      color={themeStyle.colors.grayscale.lowest}
                    />
                    <Text
                      style={{
                        fontWeight: "700",
                        color: themeStyle.colors.grayscale.lowest,
                        textAlign: "center",
                      }}
                    >
                      {" "}
                      Accept
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginVertical: 10 }}
                  onPress={() => rejectFriendRequest()}
                >
                  <View
                    style={{
                      borderColor: themeStyle.colors.grayscale.lowest,
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                    }}
                  >
                    <AntDesign
                      name="close"
                      size={20}
                      color={themeStyle.colors.grayscale.lowest}
                    />
                    <Text
                      style={{
                        fontWeight: "700",
                        color: themeStyle.colors.grayscale.lowest,
                      }}
                    >
                      {" "}
                      Delete
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : user.requestSent ? (
              <TouchableOpacity onPress={() => recallFriendRequest()}>
                <View
                  style={{
                    borderColor: themeStyle.colors.primary.default,
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 5,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      textAlign: "center",
                      color: themeStyle.colors.grayscale.lowest,
                    }}
                  >
                    Request sent
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => sendFriendRequest()}>
                <View
                  style={{
                    borderColor: themeStyle.colors.primary.default,
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 5,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Entypo
                    color={themeStyle.colors.grayscale.lowest}
                    name="add-user"
                    size={12}
                  />
                  <Text
                    style={{
                      fontWeight: "700",
                      color: themeStyle.colors.grayscale.lowest,
                      textAlign: "center",
                      marginLeft: 10,
                    }}
                  >
                    Add User
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default React.memo(ProfileInfo);
