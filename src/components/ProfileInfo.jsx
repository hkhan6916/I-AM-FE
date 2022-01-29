import React from "react";
import themeStyle from "../theme.style";
import { TouchableOpacity, View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import VideoPlayer from "../components/VideoPlayer";

const ProfileInfo = ({ navigation, userData }) => {
  return (
    <View>
      <TouchableOpacity onPress={() => navigation.navigate("SettingsScreen")}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderBottomWidth: 1,
          }}
        >
          <Text style={{ fontSize: 20 }} numberOfLines={1}>
            {userData.username}
          </Text>
          <MaterialCommunityIcons name="cog-outline" size={24} color="black" />
        </View>
      </TouchableOpacity>
      <LinearGradient
        start={[0, 0.5]}
        end={[1, 0.5]}
        style={{ padding: 4 }}
        colors={[
          themeStyle.colors.grayscale.white,
          themeStyle.colors.primary.light,
        ]}
      >
        <View
          style={{
            width: "100%",
            borderColor: themeStyle.colors.primary.default,
            backgroundColor: "white",
          }}
        >
          <VideoPlayer
            // url={userData.profileVideoUrl}
            // mediaHeaders={userData.profileVideoHeaders}
            mediaIsSelfie
            showToggle
          />
        </View>
      </LinearGradient>
    </View>
  );
};
export default React.memo(
  ProfileInfo,
  (prevProps, nextProps) => prevProps === nextProps
);
