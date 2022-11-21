import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Modal,
} from "react-native";
import { setItemAsync } from "expo-secure-store";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import themeStyle from "../../../theme.style";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import apiCall from "../../../helpers/apiCall";

const AccountScreen = () => {
  const [showDeleteGuard, setShowDeleteGuard] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const deleteAccount = async () => {
    const { success } = await apiCall("DELETE", "/user/delete");
    if (success) {
      await setItemAsync("authToken", "");
      dispatch({ type: "SET_USER_LOGGED_IN", payload: false });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        visible={showDeleteGuard}
        transparent
        onRequestClose={() => setShowDeleteGuard(false)}
      >
        <TouchableOpacity
          onPress={() => setShowDeleteGuard(false)}
          style={{ position: "absolute", top: 20, left: 20, zIndex: 999 }}
        >
          <Ionicons
            style={styles.searchIcon}
            name="arrow-back"
            size={24}
            color={themeStyle.colors.grayscale.lowest}
          />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            backgroundColor: themeStyle.colors.grayscale.highest,
            alignItems: "center",
            paddingTop: 50,
          }}
        >
          <Text
            style={{
              color: themeStyle.colors.grayscale.lowest,
              marginVertical: 20,
              fontSize: 20,
              textAlign: "center",
              fontWeight: "700",
              padding: 20,
            }}
          >
            Are you sure you want to delete your account?
          </Text>
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
              paddingHorizontal: 40,
            }}
          >
            <TouchableOpacity
              onPress={async () => {
                await deleteAccount();
              }}
              style={{
                height: 48,
              }}
            >
              <Text
                style={{
                  color: themeStyle.colors.error.default,
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                Delete
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ height: 48 }}
              onPress={() => setShowDeleteGuard(false)}
            >
              <Text
                style={{
                  color: themeStyle.colors.grayscale.lowest,
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.basicOptions}>
        <View style={styles.option}>
          <TouchableOpacity
            onPress={() => navigation.navigate("FollowersModeScreen")}
          >
            <View style={styles.optionContent}>
              <Text style={styles.basicOptionsText}>Followers Mode</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.option}>
          <TouchableOpacity
            onPress={() => navigation.navigate("AccountVisibilityScreen")}
          >
            <View style={styles.optionContent}>
              <Text style={styles.basicOptionsText}>Profile Visibility</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.signoutContainer}>
        <TouchableOpacity onPress={() => setShowDeleteGuard(true)}>
          <Text
            style={{
              color: themeStyle.colors.error.default,
              fontWeight: "700",
            }}
          >
            Delete Account
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
    textAlign: "center",
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

export default AccountScreen;
