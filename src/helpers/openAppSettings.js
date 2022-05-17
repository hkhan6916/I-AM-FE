import { Linking, Platform } from "react-native";
import { startActivityAsync, ActivityAction } from "expo-intent-launcher";
import Constants from "expo-constants";

const packageName = Constants.manifest.releaseChannel
  ? Constants.manifest.android.package
  : "com.magnetapp.magnet";

const openAppSettings = () => {
  if (Platform.OS === "ios") {
    Linking.openURL("app-settings:");
  } else {
    startActivityAsync(ActivityAction.APPLICATION_DETAILS_SETTINGS, {
      data: `package:${packageName}`,
    });
  }
};

export default openAppSettings;
