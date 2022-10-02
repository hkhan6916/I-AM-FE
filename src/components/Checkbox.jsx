import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import themeStyle from "../theme.style";

const Checkbox = ({ checked, setChecked, label }) => {
  return (
    <TouchableOpacity onPress={() => setChecked(!checked)}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 10,
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: themeStyle.colors.grayscale.lowest,
            borderRadius: 3,
            backgroundColor: checked
              ? themeStyle.colors.secondary.default
              : "rgba(0,0,0,0)",
          }}
        >
          <Ionicons
            name="checkmark"
            size={20}
            color={themeStyle.colors.white}
            style={{ opacity: checked ? 1 : 0 }}
          />
        </View>
        <Text
          style={{
            color: themeStyle.colors.grayscale.lowest,
            marginLeft: 10,
            fontWeight: "700",
          }}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default Checkbox;
