import React, { useEffect, useState } from "react";
import { Text, Switch, SafeAreaView, View, Platform } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import apiCall from "../../../helpers/apiCall";
import getWebPersistedUserData from "../../../helpers/getWebPersistedData";
import webPersistUserData from "../../../helpers/webPersistUserData";
import themeStyle from "../../../theme.style";

const AccountVisibilityScreen = () => {
  const nativeUserData = useSelector((state) => state.userData);

  const userData =
    Platform.OS === "web"
      ? { state: getWebPersistedUserData() }
      : nativeUserData;

  const dispatch = useDispatch();
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  const togglePrivateMode = async () => {
    setError("");
    setEnabled(!enabled);
    const { success, response } = await apiCall(
      "GET",
      "/user/visibility/change"
    );
    if (success) {
      dispatch({
        type: "SET_USER_DATA",
        payload: {
          ...userData.state,
          ...response.userData,
        },
      });
      webPersistUserData({
        ...userData.state,
        ...response.userData,
      });
    } else {
      setEnabled(!enabled);
      setError("Unable to toggle private mode. Please try again later");
    }
  };
  useEffect(() => {
    if (userData?.state) {
      setEnabled(!!userData.state?.private);
    }
  }, [userData]);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {error ? (
        <Text style={{ color: themeStyle.colors.error.default }}>{error}</Text>
      ) : null}
      {userData?.state?.followersMode ? (
        <Text
          style={{
            color: themeStyle.colors.grayscale.lower,
            marginHorizontal: 10,
            marginTop: 20,
            fontWeight: "700",
          }}
        >
          You cannot toggle private mode because your account is in followers
          mode.
        </Text>
      ) : null}
      <Switch
        style={{ alignSelf: "flex-start", marginTop: 20, marginLeft: 5 }}
        disabled={userData?.state?.followersMode}
        trackColor={{
          false: themeStyle.colors.grayscale.higher,
          true: themeStyle.colors.secondary.light,
        }}
        thumbColor={
          enabled
            ? themeStyle.colors.secondary.default
            : themeStyle.colors.grayscale.high
        }
        onValueChange={togglePrivateMode}
        value={enabled}
      />
      <Text
        style={{
          color: themeStyle.colors.grayscale.lowest,
          margin: 10,
          fontWeight: "700",
        }}
      >
        Private mode is {enabled ? "enabled" : "disabled"}
      </Text>

      {!userData?.state?.followersMode ? (
        <View>
          <Text
            style={{
              color: themeStyle.colors.grayscale.lower,
              padding: 10,
              marginVertical: 20,
              fontSize: 14,
            }}
          >
            Toggling <Text style={{ fontWeight: "700" }}>private mode</Text>{" "}
            will restrict your account activity to contacts only. Users not
            added as contacts will also need to send you a contact request
            before adding you or messaging you.
          </Text>
          <Text
            style={{
              color: themeStyle.colors.grayscale.lower,
              paddingHorizontal: 10,
              fontSize: 14,
            }}
          >
            Your profile will still appear in searches. This will not make your
            profile information private such as your profile video, username,
            names etc.
          </Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default AccountVisibilityScreen;
