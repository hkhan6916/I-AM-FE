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
      {console.log("hey")}
    </View>
  );
};
const styles = StyleSheet.create({
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
});
export default React.memo(Input);
