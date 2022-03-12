import React from "react";
import { AntDesign } from "@expo/vector-icons";
import VideoPlayer from "./VideoPlayer";
import themeStyle from "../theme.style";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";
import PreviewVideo from "./PreviewVideo";
import { StackActions, useNavigation } from "@react-navigation/native";

const ProfileInfo = ({
  user,
  sendFriendRequest,
  recallFriendRequest,
  rejectFriendRequest,
  removeConnection,
  acceptFriendRequest,
}) => {
  const navigation = useNavigation();

  const handleUserFriendsNavigation = () => {
    // pushes a new screen on top of the prev one to create a journey
    const pushScreen = StackActions.push("OtherUserFriendsScreen", {
      userId: user?._id,
      firstName: user?.firstName,
    });

    navigation.dispatch(pushScreen);
  };
  return (
    <View>
      <PreviewVideo
        uri={user.profileVideoUrl}
        isFullWidth
        previewText={"Tap to play"}
      />
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
          {user.jobTitle ? <Text>{user.jobTitle}</Text> : null}
        </View>

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
