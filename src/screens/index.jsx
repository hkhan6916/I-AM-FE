import {
  NavigationContainer,
  DefaultTheme,
  useNavigation,
} from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { View, Platform, LogBox } from "react-native";
import { useSelector } from "react-redux";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { setItemAsync } from "expo-secure-store";
import apiCall from "../helpers/apiCall";
import AuthScreens from "./Auth";
import UtilityScreens from "./Utility";
import MainScreens from "./Main";
import themeStyle from "../theme.style";
import FeedContext from "../Context";
import registerNotifications from "../helpers/registerNotifications";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { deleteUserSearchHistoryTable } from "../helpers/sqlite/userSearchHistory";
import { openDatabase } from "expo-sqlite";

LogBox.ignoreLogs([
  "ViewPropTypes will be removed",
  "NativeBase: The contrast ratio of",
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
]);

const Screens = () => {
  LogBox.ignoreLogs(["NativeEventEmitter", "fontFamily"]); // Ignore log notification by message

  const [loggedIn, setLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [feed, setFeed] = useState([]);
  const [notificationToken, setNotificationToken] = useState("");
  const [connectionFailed, setConnectionFailed] = useState(false);

  const loginAttemptStatus = useSelector((state) => state.loggedIn);
  const colorScheme = useColorScheme();
  const Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background:
        colorScheme === "dark"
          ? themeStyle.colors.grayscale.highest
          : themeStyle.colors.grayscale.higher,
    },
  };
  const navigationContainerRef = useRef();
  const getUserFeed = async () => {
    const { success, response, message, error } = await apiCall(
      "POST",
      "/user/feed"
    );
    console.log({ message, response, success });
    if (success) {
      setFeed(response.feed);
      setLoggedIn(true);
    } else if (error === "CONNECTION_FAILED" || message !== "Unauthorised") {
      setConnectionFailed(true);
    }
    setLoaded(true);
  };

  const registerForPushNotificationsAsync = async () => {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          experienceId: "@haroonmagnet/Magnet", // TODO: Change experience id in production
        })
      ).data;
    } else {
      alert("Must use physical device for Push Notifications");
    }
    if (Platform === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: themeStyle.colors.primary.light,
      });
    }

    return token;
  };

  useEffect(() => {
    (async () => {
      preventAutoHideAsync();
      // if not loaded, but authenticated
      if (!loaded || loginAttemptStatus.state) {
        await getUserFeed();
      }
      // if loaded, but not authenticated. This is used for logging out a user.
      if (loaded && !loginAttemptStatus.state) {
        setLoggedIn(false);
        await apiCall("GET", "/user/notifications/token/delete");
        const db = openDatabase("localdb");
        await deleteUserSearchHistoryTable(db);
      }
    })();
  }, [loginAttemptStatus]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (notificationRes) => {
        const chatId = notificationRes.notification.request.content.data.chatId;
        if (!chatId) return;
        const { response, success } = await apiCall(
          "GET",
          `/user/chat/${chatId}`
        );
        if (success) {
          navigationContainerRef.current?.navigate("ChatScreen", {
            existingChat: response,
          });
        }
      }
    );

    if (!notificationToken && loaded) {
      registerForPushNotificationsAsync().then(async (token) => {
        try {
          if (token) {
            const { success } = await apiCall(
              "POST",
              "/user/notifications/token/update",
              { notificationToken: token }
            );
            if (success) {
              await setItemAsync("notificationToken", token);
            }
            setNotificationToken(token || "none");
          } else {
            setNotificationToken("none");
          }
        } catch (error) {
          setNotificationToken("none");
          return;
        }
      });
    }
    (async () => {
      if (loaded && notificationToken) {
        await hideAsync();
      }
    })();
    return () => subscription.remove();
  }, [loaded, notificationToken]);

  return (
    <NavigationContainer theme={Theme} ref={navigationContainerRef}>
      {!loaded || !notificationToken ? (
        // just so the app has something to render always even if it's an empty view
        <View />
      ) : loaded && loggedIn && notificationToken ? (
        <FeedContext.Provider value={feed}>
          <MainScreens />
        </FeedContext.Provider>
      ) : connectionFailed ? (
        <UtilityScreens />
      ) : (
        <AuthScreens />
      )}
    </NavigationContainer>
  );
};

export default Screens;
