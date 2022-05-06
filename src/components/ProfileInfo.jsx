import React, { useState } from "react";
import { AntDesign, Entypo } from "@expo/vector-icons";
import VideoPlayer from "./VideoPlayer";
import themeStyle from "../theme.style";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
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
    const { response, success } = await apiCall("POST", "/user/report", {
      reason,
      userToReport: user._id,
    });
    console.log(response, success);
    if (!success) {
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
        setShowUserOptions={setShowUserOptions}
        error={reportError}
      />
      <PreviewVideo
        uri={user.profileVideoUrl}
        isFullWidth
        previewText={"Tap to play"}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
          marginBottom: 20,
        }}
      >
        {!user.private || user.isFriend ? (
          <TouchableOpacity
            style={{
              borderWidth: 1,
              backgroundColor: themeStyle.colors.secondary.default,
              padding: 10,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
            onPress={() => handleChatNavigation()}
          >
            <Ionicons
              name="paper-plane-outline"
              size={16}
              color={themeStyle.colors.grayscale.lowest}
            />
            <Text
              style={{
                color: themeStyle.colors.white,
                textAlign: "center",
              }}
            >
              {" "}
              Message
            </Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          onPress={() => setShowUserOptions(true)}
          style={{
            height: 40,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: themeStyle.colors.secondary.default,
            borderRadius: 100,
            marginLeft: 5,
          }}
        >
          <Entypo
            name="dots-three-vertical"
            size={16}
            color={themeStyle.colors.grayscale.lowest}
          />
        </TouchableOpacity>
      </View>
      <View style={{ padding: 5 }}>
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
            {user.username}{" "}
            {user.private && !user.isFriend ? (
              <AntDesign
                name="lock"
                size={16}
                color={themeStyle.colors.grayscale.lower}
              />
            ) : null}
          </Text>
        </View>
        {user.jobTitle ? (
          <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
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
        {!user.isSameUser ? (
          <View>
            {user.isFriend ? (
              <TouchableOpacity onPress={() => removeConnection()}>
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
                      color: themeStyle.colors.grayscale.lowest,
                      textAlign: "center",
                    }}
                  >
                    Remove Contact
                  </Text>
                </View>
              </TouchableOpacity>
            ) : user.requestReceived ? (
              <View style={{ flexDirection: "column" }}>
                <TouchableOpacity
                  style={{ margin: 10 }}
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
                      marginHorizontal: 10,
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
                  style={{ margin: 10 }}
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
                      marginHorizontal: 10,
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
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      color: themeStyle.colors.grayscale.lowest,
                      textAlign: "center",
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
