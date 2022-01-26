import React from "react";
import { View, Text } from "react-native";
import * as FacebookAds from "expo-ads-facebook";

const AdCard = (props) => {
  console.log(props.nativeAd, "hey");
  return (
    <View style={{ backgroundColor: "red", height: 20, width: 100 }}>
      <Text>{props.nativeAd.bodyText}</Text>
      <Text>hello</Text>
    </View>
  );
};

export default FacebookAds.withNativeAd(AdCard);
