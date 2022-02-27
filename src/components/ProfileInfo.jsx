import React from "react";
import { AntDesign } from "@expo/vector-icons";
import VideoPlayer from "./VideoPlayer";
import themeStyle from "../theme.style";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";
import PreviewVideo from "./PreviewVideo";

const ProfileInfo = ({
  user,
  sendFriendRequest,
  recallFriendRequest,
  rejectFriendRequest,
  removeConnection,
  acceptFriendRequest,
}) => {
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
                color={themeStyle.colors.grayscale.higher}
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
          <Text
            style={{
              marginHorizontal: 10,
              color: themeStyle.colors.grayscale.lowest,
            }}
          >
            {user.numberOfFriends} contacts
          </Text>
        </View>
        {!user.isSameUser ? (
          <View style={{ alignItems: "center" }}>
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
                    }}
                  >
                    Remove Contact
                  </Text>
                </View>
              </TouchableOpacity>
            ) : user.requestReceived ? (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={{ marginHorizontal: 10 }}
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
                      }}
                    >
                      Accept
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginHorizontal: 10 }}
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
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      color: themeStyle.colors.grayscale.lowest,
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
