import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import apiCall from "../../../helpers/apiCall";
import themeStyle from "../../../theme.style";

const FollowersModeScreen = () => {
  const userData = useSelector((state) => state.userData);
  const toggleFollowersMode = async () => {
    const { success, response } = await apiCall(
      "GET",
      "user/followersmode/toggle"
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
        {userData.followersMode ? "enabled" : "disabled"}
      </Text>
      <TouchableOpacity
        onPress={() => toggleFollowersMode()}
      ></TouchableOpacity>
      <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
        Enabling <Text style={{ fontWeight: "700" }}>followers mode</Text> will
        make your public profile follow only. Your account will be made public
        by default and you will only receive the feed for the users you add as
        contacts, not your followers.
      </Text>
    </View>
  );
};

export default FollowersModeScreen;
