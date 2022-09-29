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
const Input = ({
  label,
  value,
  onChangeText,
  error,
  onEndEditing,
  onBlur,
  placeholder,
  isOutlined,
  setValue,
  onClear,
  borderColor,
  ...rest
}) => {
  const handleClear = () => {
    if (setValue) {
      setValue("");
    }
    if (onClear) {
      onClear();
    }
  };
  return (
    <View style={styles.textInputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingRight: 10,
            borderWidth: 2,
            borderColor: borderColor || themeStyle.colors.primary.default,
            borderRadius: 5,
            paddingLeft: 10,
          },
          error &&
            typeof error === "string" && {
              borderColor: themeStyle.colors.error.default,
            },
          isOutlined && {
            color: themeStyle.colors.grayscale.lowest,
            borderWidth: 0,
            borderBottomWidth: 2,
            borderRadius: 0,
            paddingLeft: 5,
            paddingRight: 10,
          },
        ]}
      >
        <TextInput
          style={[styles.textInput]}
          placeholderTextColor={themeStyle.colors.grayscale.low}
          placeholder={placeholder || ""}
          value={value}
          onChangeText={onChangeText ? (v) => onChangeText(v) : null}
          onEndEditing={onEndEditing ? (e) => onEndEditing(e) : null}
          onBlur={onBlur ? (e) => onBlur(e) : null}
          {...rest}
        />
        {value ? (
          <TouchableOpacity onPress={() => handleClear()}>
            <AntDesign
              name="closecircle"
              size={16}
              color={themeStyle.colors.grayscale.high}
            />
          </TouchableOpacity>
        ) : null}
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
    marginTop: 5,
  },
  label: {
    fontWeight: "400",
    fontSize: 12,
    color: themeStyle.colors.grayscale.lowest,
  },
  textInput: {
    fontSize: 15,
    height: 45,
    flex: 1,
    color: themeStyle.colors.grayscale.lowest,
  },
  textInputContainer: {
    alignSelf: "stretch",
    marginBottom: 20,
  },
});
export default React.memo(Input);
