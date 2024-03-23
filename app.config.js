// the dotenv/config will read your .env file
// and merge it with process.env data
// This is just for the builds that happen outside of eas
import "dotenv/config";

export default {
  expo: {
    name: "Magnet",
    slug: "Magnet",
    version: "1.1.6",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    jsEngine: "hermes",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#000000",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.magnetapp.magnet",
      infoPlist: {
        NSCameraUsageDescription:
          "Magnet uses access to your camera to do things such as let you take photos and videos to then post on Magnet.",
        NSPhotoLibraryAddUsageDescription:
          "Magnet uses access to your photos to do things such as let you pick images and videos to then post on Magnet.",
        NSPhotoLibraryUsageDescription:
          "Magnet uses access to your photos to do things such as let you pick images and videos to then post on Magnet.",
        NSMicrophoneUsageDescription:
          "Magnet uses access to your microphone to do things such as record audio when recording videos to then post on Magnet.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
      googleServicesFile: "./google-services.json",
      package: "com.magnetapp.magnet",
      versionCode: 21,
      blockedPermissions: [
        "android.permission.USE_FINGERPRINT",
        "android.permission.USE_BIOMETRIC",
        "android.permission.WRITE_SETTINGS",
        "android.permission.VIBRATE",
        "android.permission.READ_PHONE_STATE",
        "android.permission.WRITE_CALENDAR",
        "android.permission.READ_CALENDAR",
        "android.permission.WRITE_CONTACTS",
        "android.permission.READ_CONTACTS",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_BACKGROUND_LOCATION",
        "android.permission.RECEIVE_BOOT_COMPLETED",
      ],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "react-native-compressor",
      "react-native-vision-camera",
      [
        "@config-plugins/ffmpeg-kit-react-native",
        {
          package: "min-gpl",
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            minSdkVersion: 33,
            packagingOptions: {
              pickFirst: [
                "/armeabi-v7a/libfolly_runtime.so",
                "/x86/libfolly_runtime.so",
                "/arm64-v8a/libfolly_runtime.so",
                "/x86_64/libfolly_runtime.so",
                "lib/arm64-v8a/libc++_shared.so",
                "lib/armeabi-v7a/libc++_shared.so",
                "lib/x86/libc++_shared.so",
                "lib/x86_64/libc++_shared.so",
                "lib/armeabi-v7a/libfolly_runtime.so",
                "lib/x86/libfolly_runtime.so",
                "lib/arm64-v8a/libfolly_runtime.so",
                "lib/x86_64/libfolly_runtime.so",
              ],
            },
          },
        },
      ],
    ],
    extra: {
      apiUrl:
        process.env.TESTING === "yes"
          ? process.env.TEST_API_URL
          : process.env.API_URL,
      apiWebSocketUrl:
        process.env.TESTING === "yes"
          ? process.env.TEST_API_WEBSOCKET_URL
          : process.env.API_WEBSOCKET_URL,
      experienceId: process.env.EXPERIENCE_ID,
      gptSecret: process.env.GPT_SECRET,
      packageName: process.env.PACKAGE_NAME,
      appStoreId: process.env.APP_STORE_ID,
      eas: {
        // We need this for production builds
        projectId: process.env.PROJECT_ID,
      },
    },
  },
};
