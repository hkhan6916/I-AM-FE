import React, { useState } from "react";
import themeStyle from "../theme.style";
import { TouchableOpacity, View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import VideoPlayer from "./VideoPlayer";
import PreviewVideo from "./PreviewVideo";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import apiCall from "../helpers/apiCall";

const ProfileScreenHeader = ({ userData }) => {
  const [isPrivate, setIsPrivate] = useState(!!userData.private);

  const changeUserVisibility = async () => {
    const { success } = await apiCall("GET", "/user/visibility/change");
    if (success) {
      setIsPrivate(!isPrivate);
    }
  };
  return (
    <View>
      <PreviewVideo
        uri={userData.profileVideoUrl}
        isFullWidth
        previewText={"Tap to play"}
      />
      <TouchableOpacity onPress={() => changeUserVisibility()}>
        <View
          style={{
            borderColor: themeStyle.colors.primary.default,
            borderWidth: 1,
            padding: 10,
            borderRadius: 5,
            marginVertical: 10,
          }}
        >
          <Text
            style={{
              color: themeStyle.colors.grayscale.lowest,
              textAlign: "center",
            }}
          >
            {isPrivate ? "Private" : "Public"}
          </Text>
        </View>
      </TouchableOpacity>
      {isPrivate ? (
        <Text
          style={{
            color: themeStyle.colors.grayscale.lowest,
            textAlign: "center",
            marginTop: 10,
            fontWeight: "700",
            fontSize: 12,
          }}
        >
          <AntDesign
            name={isPrivate ? "lock" : "unlock"}
            size={16}
            color={themeStyle.colors.grayscale.lower}
          />
          Your activity is only visible to friends
        </Text>
      ) : null}
      <View style={{ padding: 5, marginTop: 20 }}>
        <View
          style={{
            flexDirection: "column",
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              color: themeStyle.colors.grayscale.lowest,
            }}
          >
            {userData.username}{" "}
          </Text>
          {userData.jobTitle ? (
            <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
              {userData.jobTitle}
            </Text>
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
            color={themeStyle.colors.grayscale.lower}
          />
          <Text
            style={{
              marginHorizontal: 10,
              color: themeStyle.colors.grayscale.lowest,
            }}
          >
            {userData.numberOfFriends} contacts
          </Text>
        </View>
      </View>
      <Text> Your account is {isPrivate ? "Private" : "Public"}</Text>
    </View>
  );
};
export default React.memo(
  ProfileScreenHeader,
  (prev, next) => prev.userData === next.userData
);
