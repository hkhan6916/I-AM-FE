import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { View, Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { getItemAsync, setItemAsync } from "expo-secure-store";
import apiCall from "../helpers/apiCall";
import AuthScreens from "./Auth";
import UtilityScreens from "./Utility";
import MainScreens from "./Main";
import themeStyle from "../theme.style";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { deleteUserSearchHistoryTable } from "../helpers/sqlite/userSearchHistory";
import { openDatabase } from "expo-sqlite";
import NetInfo from "@react-native-community/netinfo";
import { totalMemory } from "expo-device";
import {
  deleteRunningUploadsTable,
  getRunningUploads,
} from "../helpers/sqlite/runningUploads";

const Screens = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [notificationToken, setNotificationToken] = useState("");
  const [connectionFailed, setConnectionFailed] = useState(false);

  const dispatch = useDispatch();
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
  const checkUserConnected = async () => {
    const { isConnected } = await NetInfo.fetch();
    if (!isConnected) {
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
        console.log("Failed to get push token for push notifications");
        return;
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          experienceId: Constants.manifest.extra.experienceId, // TODO: Move into environment variable
        })
      ).data;
    } else {
      alert("Must use a physical device for Push Notifications");
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
      await preventAutoHideAsync();
      if (!loggedIn) {
        try {
          const token =
            Platform.OS === "web"
              ? localStorage.getItem("authToken")
              : await getItemAsync("authToken");
          if (token) {
            setLoggedIn(true);
            await hideAsync();
          }
        } catch (err) {
          console.log(err);
        }
      }

      // if not loaded, but authenticated
      if (!loaded || loginAttemptStatus.state) {
        await checkUserConnected();
        await hideAsync();
      }
      // if loaded, but not authenticated. This is used for logging out a user.
      if (loaded && !loginAttemptStatus.state) {
        setLoggedIn(false);
        await apiCall("GET", "/user/notifications/token/delete");
        Platform.OS === "web"
          ? localStorage.setItem("authToken", "")
          : await setItemAsync("authToken", "");
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

    if (!notificationToken && loaded && Platform.OS !== "web") {
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
    return () => subscription.remove();
  }, [loaded, notificationToken]);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "android") {
        const db = await openDatabase("localdb");
        // a list of uploads that were running before the app was closed
        const runningUploads = await getRunningUploads(db);

        let runningUploadsForMessages = [];
        let runningUploadsForPosts = [];
        if (runningUploads?.length) {
          runningUploads.forEach((upload) => {
            if (upload?.messageId) {
              runningUploadsForMessages.push(upload.messageId);
            }
            if (upload?.postId) {
              runningUploadsForPosts.push(upload.postId);
            }
          });

          if (runningUploadsForMessages?.length) {
            const multipleMessages = runningUploadsForMessages.length > 1;
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `Failed to send ${
                  multipleMessages ? "messages" : "message"
                }`,
                body: `Connection was lost when sending your ${
                  multipleMessages ? "messages" : "message"
                }.`,
              },
              trigger: { seconds: 2 },
            });

            await apiCall("POST", "/chat/message/bulk-fail", {
              messageIds: runningUploadsForMessages,
            });
          }
          if (runningUploadsForPosts?.length) {
            const multiplePosts = runningUploadsForPosts.length > 1;
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `Failed to upload ${multiplePosts ? "posts" : "post"}`,
                body: `Connection was lost when uploading your ${
                  multiplePosts ? "posts" : "post"
                }.`,
              },
              trigger: { seconds: 2 },
            });
            await apiCall("POST", "/posts/bulk-fail", {
              postIds: runningUploadsForPosts,
            });
          }

          // We delete the table even if the above request is not successful. This is incase there is an issue marking a single message/post as failed which would hold up the rest of the messages/posts. If we just delete the table, we no longer have to process this message/post and start fresh allowing newer messages/posts to be marked as failed. The prev messages/posts will just stay as "sending..." which the user can delete later if this ever happens.
          await deleteRunningUploadsTable(db);
        }

        const ram = totalMemory;
        // if android phone has less than 5gb ram or ram is undefined, don't play feed videos and mark as low end device.
        if (!ram || ram / 1000000000 < 5) {
          dispatch({ type: "SET_CAN_PLAY_FEED_VIDEOS", payload: false });
          dispatch({ type: "SET_IS_LOW_END_DEVICE", payload: true });
        }
      }
    })();
  }, []);
  return (
    <NavigationContainer
      linking={{}}
      theme={Theme}
      ref={navigationContainerRef}
    >
      {connectionFailed ? (
        <UtilityScreens />
      ) : loggedIn ? (
        <MainScreens />
      ) : loaded ? (
        <AuthScreens />
      ) : (
        <View />
      )}
    </NavigationContainer>
  );
};

export default Screens;
