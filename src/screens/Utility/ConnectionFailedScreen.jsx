import React from "react";
import { View, Text } from "react-native";
import themeStyle from "../../theme.style";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ConnectionFailedScreen = () => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
    <Text
      style={{
        color: themeStyle.colors.grayscale.lowest,
        textAlign: "center",
        fontSize: 20,
        marginHorizontal: 10,
        marginBottom: 50,
      }}
    >
      There seems to be a connection issue. Please check your connection and try
      again.
    </Text>
    <MaterialCommunityIcons
      name="connection"
      size={100}
      color={themeStyle.colors.primary.default}
    />
  </View>
);

export default ConnectionFailedScreen;
