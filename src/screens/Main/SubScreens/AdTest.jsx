import { StatusBar } from "expo-status-bar";
import { StyleSheet, Button, Platform, View } from "react-native";
import React from "react";
import * as FacebookAds from "expo-ads-facebook";
import AdCard from "../../../components/AdCard";

export default function AdScreen() {
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

  const bannerId = getPlacementId(true);
  const interstitialId = getPlacementId(false);
  const adsManager = new FacebookAds.NativeAdsManager(
    "IMG_16_9_LINK#3130380047243958_3130406723907957"
  );

  console.log(adsManager);

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
  //   function getBannerAd() {
  //     if (isLoaded) {
  //       return (
  //         <FacebookAds.BannerAd
  //           placementId={bannerId}
  //           type="large"
  //           onPress={() => console.log("click")}
  //           onError={(error) => console.log(error.nativeEvent)}
  //         />
  //       );
  //     }
  //   }

  return (
    <View style={styles.container}>
      <AdCard
        adsManager={adsManager}
        onAdLoaded={(e) => console.log(e)}
        onError={(e) => console.log(e)}
      />
      {/* <View style={styles.content}>
        <Button title="Show Interstitial" onPress={showInterstitial} />
      </View> */}
      {/* <View style={styles.adView}>{getBannerAd()}</View> */}
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
