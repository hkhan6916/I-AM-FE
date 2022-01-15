import React from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { setItemAsync } from "expo-secure-store";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import themeStyle from "../../../theme.style";
import { Feather } from "@expo/vector-icons";

const SettingScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const logout = async () => {
    await setItemAsync("authToken", "");
    dispatch({ type: "SET_USER_LOGGED_IN", payload: false });
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.basicOptions}>
        <View style={styles.option}>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditProfileScreen")}
          >
            <View style={styles.optionContent}>
              <Feather name="edit-2" size={14} color="black" />
              <Text style={styles.basicOptionsText}>Edit profile</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.option}>
        <TouchableOpacity onPress={() => logout()}>
          <Text style={{ color: themeStyle.colors.error.default }}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  basicOptions: {
    width: "100%",
  },
  basicOptionsText: {
    color: themeStyle.colors.grayscale.black,
    paddingHorizontal: 5,
    fontSize: 16,
    fontWeight: "700",
  },
  option: {
    padding: 20,
    width: "100%",
    alignItems: "center",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default SettingScreen;
