import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import themeStyle from "../theme.style";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const PasswordInputNoBorder = ({
  label,
  value,
  onChangeText,
  error,
  onEndEditing,
  placeholder,
  isOutlined,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.textInputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.passwordInputContainer,
          isOutlined && {
            borderWidth: 0,
            borderBottomWidth: 2,
            borderRadius: 0,
            paddingLeft: 5,
          },
          error && {
            borderColor: themeStyle.colors.error.default,
            borderWidth: 1,
          },
        ]}
      >
        <TextInput
          style={styles.passwordInput}
          placeholderTextColor={themeStyle.colors.grayscale.lightGray}
          secureTextEntry={!showPassword}
          autoCorrect={false}
          placeholder={placeholder || ""}
          value={value}
          onChangeText={onChangeText ? (v) => onChangeText(v) : null}
          onEndEditing={onEndEditing ? (e) => onEndEditing(e) : null}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={19}
          />
        </TouchableOpacity>
      </View>
      {error && typeof error === "string" ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
};
const styles = StyleSheet.create({
  errorText: {
    fontSize: 12,
    color: themeStyle.colors.error.default,
  },
  label: {
    fontWeight: "400",
    fontSize: 12,
  },
  textInput: {
    fontSize: 15,
    height: 45,
    borderRadius: 5,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
  },
  textInputContainer: {
    alignSelf: "stretch",
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: themeStyle.colors.grayscale.black,
  },
  passwordInputContainer: {
    flexDirection: "row",
    height: 45,
    padding: 5,
    paddingHorizontal: 8,
    backgroundColor: themeStyle.colors.grayscale.superLightGray,
  },
  eyeIcon: {
    justifyContent: "center",
    paddingHorizontal: 5,
  },
});
export default React.memo(PasswordInputNoBorder);