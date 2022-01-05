import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import themeStyle from "../theme.style";
const Input = ({ label, value, onChangeText, error, onEndEditing }) => {
  return (
    <View style={styles.textInputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.visibleTextInputs,
          error && {
            borderColor: themeStyle.colors.error.default,
          },
        ]}
        value={value}
        onChangeText={onChangeText ? (v) => onChangeText(v) : null}
        onEndEditing={onEndEditing ? (e) => onEndEditing(e) : null}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.colors.grayscale.white,
  },
  formContainer: {
    padding: 20,
    backgroundColor: themeStyle.colors.grayscale.white,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  formHeader: {
    fontSize: 20,
  },
  registerationError: {
    textAlign: "center",
    color: themeStyle.colors.error.default,
    fontWeight: "500",
  },
  faceDetectionError: {
    color: themeStyle.colors.error.default,
    textAlign: "center",
    fontWeight: "700",
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  registerationButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 20,
    borderRadius: 50,
    backgroundColor: themeStyle.colors.primary.default,
  },
  registerationButtonText: {
    color: themeStyle.colors.grayscale.white,
  },
  takeVideoButton: {
    margin: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
    borderRadius: 5,
  },
  takeVideoButtonText: {
    color: themeStyle.colors.grayscale.black,
    fontWeight: "700",
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  errorText: {
    fontSize: 12,
    color: themeStyle.colors.error.default,
  },
  label: {
    fontWeight: "700",
  },
  visibleTextInputs: {
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
    borderRadius: 5,
    marginBottom: 20,
    padding: 5,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
  },
  eyeIcon: {
    justifyContent: "center",
    paddingHorizontal: 5,
  },
});
export default Input;
