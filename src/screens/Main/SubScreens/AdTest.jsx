import { StatusBar } from "expo-status-bar";
import { StyleSheet, Button, Platform, View, FlatList } from "react-native";
import React from "react";
import * as FacebookAds from "expo-ads-facebook";
import AdCard from "../../../components/AdCard";

export default function AdScreen() {
  const data = [
    {
      news_url:
        "https://www.kitco.com/news/2022-03-17/Gold-price-has-a-path-to-2-200-after-Fed-revealed-its-strategy-SSGA-s-Milling-Stanley.html",
      image_url:
        "https://cdn.snapi.dev/images/v1/6/q/three-all-cap-index-sectors-trade-below-economic-book-value-post-3q21-earnings-1155125-1282957.jpg",
      title:
        "Gold price has a path to $2,200 after Fed revealed its strategy - SSGA's Milling-Stanley",
      text: "(Kitco News) - The Federal Reserve has laid out a clear tightening path, and now gold prices are free to push to new highs above $2,000 an ounce as inflation will remain a clear threat to consumers, according to one market strategist.",
      source_name: "Kitco",
      date: "Thu, 17 Mar 2022 13:13:25 -0400",
      topics: ["gold"],
      sentiment: "Neutral",
      type: "Article",
    },
  ];

  // const id = AdSettings.currentDeviceHash();

  // console.log({ id });

  let [isLoaded, setIsLoaded] = React.useState(false);
  FacebookAds.AdSettings.addTestDevice(
    FacebookAds.AdSettings.currentDeviceHash
  );
  function getPlacementId(bannerAd) {
    let placementId;
    if (bannerAd) {
      placementId =
        Platform.OS === "ios"
          ? "3130380047243958_3131771590438137"
          : "3130380047243958_3131771590438137";
    } else {
      placementId =
        Platform.OS === "ios"
          ? "3130380047243958_3131771590438137"
          : "3130380047243958_3131771590438137";
    }

    if (__DEV__) {
      return `VID_HD_9_16_39S_LINK#${placementId}`;
    }

    return placementId;
  }

  const adsManager = new FacebookAds.NativeAdsManager(
    "3130380047243958_3167702336845062",
    1
  );

  console.log({ adsManager });

  return (
    <View style={styles.container}>
      {adsManager ? (
        <AdCard
          adsManager={adsManager}
          onAdLoaded={(e) => console.log({ e })}
          onError={(e) => console.log(e)}
        />
      ) : // <FlatList
      //   data={data}
      //   keyExtractor={(item, i) => i}
      //   renderItem={() => {
      //     return (
      //     );
      //   }}
      // />
      null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  adView: {
    alignItems: "flex-start",
    alignSelf: "stretch",
  },
});
