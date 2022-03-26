import { AntDesign } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import themeStyle from "../theme.style";
const InputNoBorder = ({
  label,
  value,
  onChangeText,
  error,
  onEndEditing,
  setValue,
}) => {
  return (
    <View style={styles.textInputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            flex: 1,
            backgroundColor: themeStyle.colors.grayscale.higher,
            paddingRight: 10,
          },
          error && {
            borderColor: themeStyle.colors.error.default,
            borderWidth: 1,
          },
        ]}
      >
        <TextInput
          style={[styles.visibleTextInputs]}
          value={value}
          onChangeText={onChangeText ? (v) => onChangeText(v) : null}
          onEndEditing={onEndEditing ? (e) => onEndEditing(e) : null}
        />
        {value ? (
          <TouchableOpacity onPress={setValue ? () => setValue("") : null}>
            <AntDesign
              name="closecircle"
              size={16}
              color={themeStyle.colors.grayscale.high}
            />
          </TouchableOpacity>
        ) : null}
      </View>
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
    color: themeStyle.colors.grayscale.lowest,
  },
  visibleTextInputs: {
    fontSize: 15,
    height: 45,
    paddingHorizontal: 10,
    backgroundColor: themeStyle.colors.grayscale.higher,
    flex: 1,
    color: themeStyle.colors.grayscale.lowest,
  },
  textInputContainer: {
    alignSelf: "stretch",
    marginBottom: 20,
  },
});
export default React.memo(InputNoBorder);
