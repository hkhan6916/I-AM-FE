import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import themeStyle from "../theme.style";
const InputNoBorder = ({ label, value, onChangeText, error, onEndEditing }) => {
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
    paddingHorizontal: 10,
    backgroundColor: themeStyle.colors.grayscale.superLightGray,
  },
  textInputContainer: {
    alignSelf: "stretch",
    marginBottom: 20,
  },
});
export default React.memo(InputNoBorder);
