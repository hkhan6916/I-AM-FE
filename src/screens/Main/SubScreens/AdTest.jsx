import { StatusBar } from "expo-status-bar";
import { StyleSheet, Button, Platform, View } from "react-native";
import React from "react";
import * as FacebookAds from "expo-ads-facebook";
import AdCard from "../../../components/AdCard";

export default function AdScreen() {
  let [isLoaded, setIsLoaded] = React.useState(false);

  function getPlacementId(bannerAd) {
    let placementId;
    if (bannerAd) {
      placementId =
        Platform.OS === "ios"
          ? "3130380047243958_3131780643770565"
          : "3130380047243958_3131780643770565";
    } else {
      placementId =
        Platform.OS === "ios"
          ? "3130380047243958_3131771590438137"
          : "3130380047243958_3131771590438137";
    }

    if (__DEV__) {
      return `IMG_16_9_APP_INSTALL#${placementId}`;
    }

    return placementId;
  }

  const bannerId = getPlacementId(true);
  const interstitialId = getPlacementId(false);
  const adsManager = new FacebookAds.NativeAdsManager(
    "IMG_16_9_APP_INSTALL#3130380047243958_3130406723907957",
    1
  );

  FacebookAds.AdSettings.requestPermissionsAsync().then((permissions) => {
    let canTrack = permissions.status === "granted";
    FacebookAds.AdSettings.setAdvertiserTrackingEnabled(canTrack);
    setIsLoaded(true);
  });

  function showInterstitial() {
    FacebookAds.InterstitialAdManager.showAd(interstitialId)
      .then((didClick) => console.log({ didClick }))
      .catch((error) => console.log({ error }));
  }
  console.log(adsManager);
  function getBannerAd() {
    if (isLoaded) {
      return (
        <FacebookAds.BannerAd
          placementId={bannerId}
          type="large"
          onPress={() => console.log("click")}
          onError={(error) => console.log(error.nativeEvent)}
        />
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Button title="Show Interstitial" onPress={showInterstitial} />
      </View>
      <AdCard adsManager={adsManager} />
      <View style={styles.adView}>{getBannerAd()}</View>
      <StatusBar style="auto" />
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
