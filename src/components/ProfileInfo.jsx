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
      <PreviewVideo uri={user.profileVideoUrl} isFullWidth />
      <View style={{ padding: 5 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "700" }}>
            {user.username}{" "}
            {user.private && !user.isFriend ? (
              <AntDesign
                name="lock"
                size={16}
                color={themeStyle.colors.grayscale.darkGray}
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

export default React.memo(ProfileInfo);
