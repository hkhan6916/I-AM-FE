import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import themeStyle from "../../../../theme.style";
import Logo from "../../../../Logo";
const HomeScreenHeader = ({ userData, navigation }) => {
  const colorSchema = useColorScheme();

  return (
    <View>
      <StatusBar
        backgroundColor={themeStyle.colors.black}
        barStyle="light-content"
      />
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor:
            colorSchema === "dark"
              ? themeStyle.colors.grayscale.highest
              : themeStyle.colors.grayscale.higher,
          borderBottomWidth: 1,
          borderBottomColor: themeStyle.colors.grayscale.lowest,
        }}
      >
        <View style={{ marginHorizontal: 20 }}>
          <Logo fill={themeStyle.colors.grayscale.lowest} />
        </View>
        <TouchableOpacity
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => navigation.navigate("ChatListScreen")}
        >
          <View style={{ flexDirection: "row" }}>
            <Ionicons
              name="paper-plane-outline"
              size={24}
              color={themeStyle.colors.grayscale.lowest}
              style={{ marginRight: 22, paddingVertical: 10 }}
            />
            {userData?.unreadChatsCount ? (
              <View
                style={{
                  backgroundColor: themeStyle.colors.primary.default,
                  borderRadius: 100,
                  minWidth: 20,
                  height: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: -5,
                  zIndex: 10,
                  paddingHorizontal: 5,
                  position: "absolute",
                  left: 15,
                  top: 0,
                }}
              >
                <Text
                  style={{
                    color: themeStyle.colors.white,
                    textAlign: "center",
                    fontSize: 12,
                    maxWidth: 50,
                  }}
                  numberOfLines={1}
                >
                  {userData.unreadChatsCount >= 10
                    ? "10+"
                    : userData.unreadChatsCount}
                </Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(HomeScreenHeader);
