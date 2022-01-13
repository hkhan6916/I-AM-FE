import React from "react";

import { SafeAreaView, Text, TouchableOpacity } from "react-native";
import { setItemAsync } from "expo-secure-store";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";

const SettingScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const logout = async () => {
    await setItemAsync("authToken", "");
    dispatch({ type: "SET_USER_LOGGED_IN", payload: false });
  };
  return (
    <SafeAreaView>
      <TouchableOpacity
        onPress={() => navigation.navigate("EditProfileScreen")}
      >
        <Text>Edit profile</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => logout()}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SettingScreen;
