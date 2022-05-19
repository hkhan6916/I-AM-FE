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
  setUser,
  setUserPosts,
  canAdd,
}) => {
  const [showUserOptions, setShowUserOptions] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

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
      setModalError(
        "There was an issue reporting this user. Please try again later."
      );
    }
  };

  const blockUser = async () => {
    setModalLoading(true);
    setModalError("");
    const { success } = await apiCall("GET", `/user/block/${user?._id}`);
    setModalLoading(false);
    if (!success) {
      setModalError(
        "There was an issue blocking this user. Please try again later."
      );
    } else {
      setUser({ ...user, blocked: true, isFriend: false });
      if (user.private) {
        setUserPosts([]);
      }
      setShowUserOptions(false);
    }
  };

  const unblockUser = async () => {
    setModalLoading(true);
    setModalError("");
    const { success } = await apiCall("GET", `/user/unblock/${user?._id}`);
    setModalLoading(false);
    if (!success) {
      setModalError(
        "There was an issue unblocking this user. Please try again later."
      );
    } else {
      setUser({ ...user, blocked: false });
      setShowUserOptions(false);
    }
  };

  if (!user) {
    return <View />;
  }
  return (
    <View>
      <UserOptionsModal
        reportUser={reportUser}
        blockUser={blockUser}
        unblockUser={unblockUser}
        showOptions={showUserOptions}
        loading={modalLoading}
        setShowUserOptions={(value) => {
          setShowUserOptions(value);
          setModalError("");
        }}
        error={modalError}
        onHide={() => setModalError("")}
        user={user}
        removeConnection={removeConnection}
      />

      <PreviewVideo
        uri={user.profileVideoUrl}
        flipProfileVideo={user.flipProfileVideo}
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
            disabled={(user.private && !user.isFriend) || !canAdd}
            onPress={() => handleChatNavigation()}
            style={{ flex: 1, opacity: canAdd ? 1 : 0.5 }}
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
      ) : !canAdd ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text
            style={{
              color: themeStyle.colors.grayscale.lowest,
              textAlign: "center",
              marginTop: 20,
            }}
          >
            Complete your profile so you can add other contacts.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditUserDetailsScreen")}
          >
            <View
              style={{
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderWidth: 1,
                backgroundColor: themeStyle.colors.secondary.default,
                borderRadius: 5,
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  color: themeStyle.colors.white,
                  textAlign: "center",
                }}
              >
                Complete my profile
              </Text>
            </View>
          </TouchableOpacity>
        </View>
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

        {user.blocked ? (
          <Text
            style={{
              color: themeStyle.colors.grayscale.lowest,
              textAlign: "center",
            }}
          >
            You have blocked this user
          </Text>
        ) : !user.isSameUser && !user.isFriend ? (
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
                  disabled={!canAdd}
                  onPress={() => acceptFriendRequest()}
                >
                  <View
                    style={{
                      borderColor: canAdd
                        ? themeStyle.colors.success.default
                        : themeStyle.colors.grayscale.high,
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      opacity: canAdd ? 1 : 0.5,
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
              <TouchableOpacity
                disabled={!canAdd}
                onPress={() => sendFriendRequest()}
              >
                <View
                  style={{
                    borderColor: canAdd
                      ? themeStyle.colors.success.default
                      : themeStyle.colors.grayscale.high,
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 5,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: canAdd ? 1 : 0.5,
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
