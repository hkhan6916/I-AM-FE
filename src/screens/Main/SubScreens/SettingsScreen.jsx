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
import { Ionicons } from "@expo/vector-icons";

const SettingScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const logout = async () => {
    dispatch({ type: "SET_USER_LOGGED_IN", payload: false });
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.basicOptions}>
        <View style={styles.option}>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditUserDetailsScreen")}
          >
            <View style={styles.optionContent}>
              <Ionicons
                name="create-outline"
                size={14}
                color={themeStyle.colors.grayscale.lowest}
              />
              <Text style={styles.basicOptionsText}>Edit My Details</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.option}>
          <TouchableOpacity
            onPress={() => navigation.navigate("AccountScreen")}
          >
            <View style={styles.optionContent}>
              <Ionicons
                name="person-outline"
                size={14}
                color={themeStyle.colors.grayscale.lowest}
              />
              <Text style={styles.basicOptionsText}>Account Settings</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.option}>
          <TouchableOpacity
            onPress={() => navigation.navigate("PrivacyPolicyScreen")}
          >
            <View style={styles.optionContent}>
              <Ionicons
                name="lock-closed-outline"
                size={14}
                color={themeStyle.colors.grayscale.lowest}
              />
              <Text style={styles.basicOptionsText}>Privacy Policy</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.option}>
          <TouchableOpacity
            onPress={() => navigation.navigate("TermsOfUseScreen")}
          >
            <View style={styles.optionContent}>
              <Ionicons
                name="clipboard-outline"
                size={14}
                color={themeStyle.colors.grayscale.lowest}
              />
              <Text style={styles.basicOptionsText}>Terms Of Use</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.signoutContainer}>
        <TouchableOpacity onPress={() => logout()}>
          <Text
            style={{
              color: themeStyle.colors.error.default,
              fontWeight: "700",
            }}
          >
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
    color: themeStyle.colors.grayscale.lowest,
    paddingHorizontal: 5,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "left",
    marginLeft: 20,
    width: "100%",
    paddingRight: 14,
  },
  option: {
    width: "100%",
    borderBottomWidth: 0.5,
    borderColor: themeStyle.colors.grayscale.high,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  signoutContainer: {
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderColor: themeStyle.colors.grayscale.lowest,
    width: "100%",
  },
});

export default SettingScreen;
