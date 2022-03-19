import React, { useState } from "react";
import { View, TouchableOpacity, Text, Image } from "react-native";
import Collapsible from "react-native-collapsible";
import themeStyle from "../theme.style";
import { withNativeAd } from "expo-ads-facebook";

const NewsDropdown = ({ newsBlock }) => {
  const [collapsed, setCollapsed] = useState(true); // this is weird, but the library has a backwards collapsed toggle

  return (
    <View style={{ marginVertical: 5 }}>
      <TouchableOpacity onPress={() => setCollapsed(!collapsed)}>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Image
            style={{ width: 70, aspectRatio: 1 / 1 }}
            source={{ uri: newsBlock?.image_url }}
          />
          <Text
            style={{
              color: themeStyle.colors.grayscale.lowest,
              marginHorizontal: 20,
              // height: "100%",
              flex: 1,
            }}
          >
            {newsBlock?.title}
          </Text>
        </View>
      </TouchableOpacity>
      <Collapsible collapsed={collapsed}>
        <Text
          style={{
            color: themeStyle.colors.grayscale.lowest,
            margin: 5,
            // height: "100%",
            flex: 1,
          }}
        >
          {newsBlock?.text}
        </Text>
      </Collapsible>
    </View>
  );
};
export default withNativeAd(NewsDropdown);
