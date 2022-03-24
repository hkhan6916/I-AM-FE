import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  SafeAreaView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import apiCall from "../../../helpers/apiCall";
import themeStyle from "../../../theme.style";

const FollowersModeScreen = () => {
  const userData = useSelector((state) => state.userData);
  const dispatch = useDispatch();
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  const toggleFollowersMode = async () => {
    setError("");
    setEnabled(!enabled);
    const { success, response } = await apiCall(
      "GET",
      "/user/followersmode/toggle"
    );
    console.log(response);
    if (success) {
      dispatch({
        type: "SET_USER_DATA",
        payload: {
          ...userData.state,
          followersMode: response.followersMode,
        },
      });
    } else {
      setEnabled(!enabled);
      setError(
        "Unable to toggle followers mode. Please check your connection and try again"
      );
    }
  };
  useEffect(() => {
    if (userData?.state) {
      setEnabled(!!userData.state.followersMode);
    }
  }, [userData]);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {error ? (
        <Text style={{ color: themeStyle.colors.error.default }}>{error}</Text>
      ) : null}
      <Switch
        style={{ alignSelf: "flex-start", marginTop: 20 }}
        trackColor={{
          false: themeStyle.colors.grayscale.higher,
          true: themeStyle.colors.secondary.light,
        }}
        thumbColor={
          enabled
            ? themeStyle.colors.secondary.default
            : themeStyle.colors.grayscale.high
        }
        onValueChange={toggleFollowersMode}
        value={enabled}
      />
      <Text
        style={{
          color: themeStyle.colors.grayscale.lowest,
          margin: 10,
          fontWeight: "700",
        }}
      >
        Followers mode is {enabled ? "enabled" : "disabled"}
      </Text>
      <Text
        style={{
          color: themeStyle.colors.grayscale.low,
          padding: 10,
          marginVertical: 20,
          fontSize: 14,
        }}
      >
        Enabling <Text style={{ fontWeight: "700" }}>followers mode</Text> will
        make your public profile follow only. Your account will be made public
        by default and you will only receive the feed for the users you add as
        contacts, not your followers.
      </Text>
    </SafeAreaView>
  );
};

export default FollowersModeScreen;