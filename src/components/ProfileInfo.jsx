import React from "react";
import { AntDesign } from "@expo/vector-icons";
import VideoPlayer from "./VideoPlayer";
import themeStyle from "../theme.style";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";

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
      <LinearGradient
        start={[0, 0.5]}
        end={[1, 0.5]}
        style={{ padding: 4 }}
        colors={[
          themeStyle.colors.grayscale.white,
          themeStyle.colors.primary.light,
        ]}
      >
        <VideoPlayer
          // url={user.profileVideoUrl}
          // mediaHeaders={user.profileVideoHeaders}
          mediaIsSelfie
          showToggle
        />
      </LinearGradient>
      <View style={{ padding: 5 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "700" }}>{user.username}</Text>
          {user.private && !user.isFriend ? (
            <View
              style={{
                borderWidth: 1,
                alignSelf: "flex-start",
                paddingVertical: 2,
                paddingHorizontal: 5,
                borderRadius: 5,
                marginLeft: 20,
                borderColor: themeStyle.colors.secondary.default,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <AntDesign
                name="lock"
                size={20}
                color={themeStyle.colors.grayscale.darkGray}
              />
              <Text>private</Text>
            </View>
          ) : null}
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
            color={themeStyle.colors.grayscale.darkGray}
          />
          <Text style={{ marginHorizontal: 10 }}>
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
                  <Text style={{ fontWeight: "700" }}>Remove Contact</Text>
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
                    <AntDesign name="check" size={20} color="black" />
                    <Text style={{ fontWeight: "700" }}>Accept</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginHorizontal: 10 }}
                  onPress={() => rejectFriendRequest()}
                >
                  <View
                    style={{
                      borderColor: themeStyle.colors.grayscale.black,
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      alignItems: "center",
                      justifyContent: "center",
                      marginHorizontal: 10,
                      flexDirection: "row",
                    }}
                  >
                    <AntDesign name="close" size={20} color="black" />
                    <Text style={{ fontWeight: "700" }}>Delete</Text>
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
                  <Text style={{ fontWeight: "700", textAlign: "center" }}>
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

export default React.memo(
  ProfileInfo,
  (prevProps, nextProps) => prevProps === nextProps
);
