import React from "react";
import { View, Text } from "react-native";
// import {
//   withNativeAd,
//   AdTriggerView,
//   AdMediaView,
//   AdIconView,
//   AdOptionsView,
// } from "expo-ads-facebook";
import themeStyle from "../theme.style";

const AdCard = (props) => {
  return (
    <View
      style={{
        elevation: 1,
        zIndex: 1,
        backgroundColor: themeStyle.colors.grayscale.highest,
        marginVertical: 3,
        padding: 5,
      }}
    >
      {/* <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <AdIconView style={{ width: 30, height: 30, margin: 5 }} />
          <View
            style={{
              flexDirection: "column",
              height: "100%",
              marginHorizontal: 5,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontWeight: "700",
                fontSize: 12,
                color: themeStyle.colors.grayscale.lowest,
              }}
            >
              {props.nativeAd.advertiserName}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: themeStyle.colors.grayscale.lowest,
              }}
            >
              {props.nativeAd.sponsoredTranslation}
            </Text>
          </View>
        </View>
        <AdOptionsView style={{ height: 48, width: 48 }} />
      </View>
      <View
        style={{
          paddingVertical: 10,
          backgroundColor: themeStyle.colors.grayscale.lower,
        }}
      >
        <AdMediaView
          style={{
            width: "100%",
            aspectRatio: 16 / 9,
          }}
        />
      </View>
      <Text style={{ color: themeStyle.colors.grayscale.high }}>
        {props.nativeAd.socialContext}
      </Text>
      <Text style={{ color: themeStyle.colors.grayscale.lowest, fontSize: 12 }}>
        {props.nativeAd.bodyText}
      </Text>
      <Text style={{ color: themeStyle.colors.grayscale.lowest, fontSize: 12 }}>
        {props.nativeAd?.linkDescription}
      </Text>
      <AdTriggerView>
        <Text
          numberOfLines={1}
          style={{ color: themeStyle.colors.secondary.default }}
        >
          {props.nativeAd.callToActionText}
        </Text>
      </AdTriggerView> */}
    </View>
  );
};

// export default withNativeAd(AdCard);
