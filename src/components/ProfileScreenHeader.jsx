import React from "react";
import themeStyle from "../theme.style";
import { TouchableOpacity, View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import VideoPlayer from "./VideoPlayer";
import PreviewVideo from "./PreviewVideo";
import { AntDesign, Ionicons } from "@expo/vector-icons";

const ProfileScreenHeader = ({ navigation, userData }) => {
  return (
    <View>
      <PreviewVideo
        uri={userData.profileVideoUrl}
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
            {userData.username}{" "}
            {userData.private && !userData.isFriend ? (
              <AntDesign
                name="lock"
                size={16}
                color={themeStyle.colors.grayscale.lower}
              />
            ) : null}
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
      <TouchableOpacity>
        <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
          {userData.private ? "Private" : "Public"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
export default React.memo(
  ProfileScreenHeader,
  (prev, next) => prev.userData === next.userData
);
