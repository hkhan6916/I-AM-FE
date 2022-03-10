import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import themeStyle from "../theme.style";
const Input = ({
  label,
  value,
  onChangeText,
  error,
  onEndEditing,
  placeholder,
  isOutlined,
}) => {
  return (
    <View style={styles.textInputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          isOutlined && {
            color: themeStyle.colors.grayscale.lowest,
            borderWidth: 0,
            borderBottomWidth: 2,
            borderRadius: 0,
            paddingLeft: 5,
          },
          error &&
            typeof error === "string" && {
              borderColor: themeStyle.colors.error.default,
            },
        ]}
        placeholderTextColor={themeStyle.colors.grayscale.lower}
        placeholder={placeholder || ""}
        value={value}
        onChangeText={onChangeText ? (v) => onChangeText(v) : null}
        onEndEditing={onEndEditing ? (e) => onEndEditing(e) : null}
      />
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
    color: themeStyle.colors.grayscale.lowest,
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
});
export default React.memo(Input);
