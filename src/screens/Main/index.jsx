import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabStack from "./MainTabStack";
import UserProfileScreen from "./SubScreens/UserProfileScreen";
import MediaScreen from "./SubScreens/MediaScreen";
import ShareScreen from "./SubScreens/ShareScreen";
import CommentsScreen from "./SubScreens/CommentsScreen";
import CommentsRepliesScreen from "./SubScreens/CommentRepliesScreen";
import themeStyle from "../../theme.style";
import PostScreen from "./SubScreens/PostScreen";
import ChatScreen from "./SubScreens/ChatScreen";
import ChatListScreen from "./SubScreens/ChatListScreen";
import CreateChatScreen from "./SubScreens/CreateChatScreen";
import EditUserDetailsScreen from "./SubScreens/EditUserDetailsScreen";
import SettingsScreen from "./SubScreens/SettingsScreen";
import PrivacyPolicyScreen from "./SubScreens/PrivacyPolicyScreen";
import TermsOfUseScreen from "./SubScreens/TermsOfUseScreen";
import OtherUserFriendsScreen from "./SubScreens/OtherUserFriendsScreen";
import EditPostScreen from "./SubScreens/EditPostScreen";
import AccountScreen from "./SubScreens/AccountScreen";
import FollowersModeScreen from "./SubScreens/FollowersModeScreen";
import AdScreen from "./SubScreens/AdTest";
import Test from "./SubScreens/Test";

const Stack = createNativeStackNavigator();

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { elevation: 0 },
      cardStyle: { backgroundColor: themeStyle.colors.grayscale.highest },
    }}
    initialRouteName="MainTabStack"
  >
    <Stack.Screen
      options={{
        headerShown: false,
      }}
      name="MainTabStack"
      component={MainTabStack}
    />
    <Stack.Screen
      options={{
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
        title: "",
      }}
      name="UserProfileScreen"
      component={UserProfileScreen}
    />
    <Stack.Screen
      options={{
        headerShown: false,
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="MediaScreen"
      component={MediaScreen}
    />
    <Stack.Screen
      options={{
        title: "Share",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="ShareScreen"
      component={ShareScreen}
    />
    <Stack.Screen
      options={{
        title: "Comments",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="CommentsScreen"
      component={CommentsScreen}
    />
    <Stack.Screen
      options={{
        title: "Replies",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="CommentRepliesScreen"
      component={CommentsRepliesScreen}
    />
    <Stack.Screen
      options={{
        headerShown: false,
      }}
      name="PostScreen"
      component={PostScreen}
    />
    <Stack.Screen
      options={{
        title: "",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="ChatScreen"
      component={ChatScreen}
    />
    <Stack.Screen
      options={{
        title: "ChatListScreen",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="ChatListScreen"
      component={ChatListScreen}
    />
    <Stack.Screen
      options={{
        title: "CreateChatScreen",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="CreateChatScreen"
      component={CreateChatScreen}
    />
    <Stack.Screen
      options={{
        title: "Edit Details",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="EditUserDetailsScreen"
      component={EditUserDetailsScreen}
    />
    <Stack.Screen
      options={{
        title: "My Account",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="AccountScreen"
      component={AccountScreen}
    />
    <Stack.Screen
      options={{
        title: "Settings",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="SettingsScreen"
      component={SettingsScreen}
    />
    <Stack.Screen
      options={{
        title: "Privacy Policy",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="PrivacyPolicyScreen"
      component={PrivacyPolicyScreen}
    />
    <Stack.Screen
      options={{
        title: "Terms Of Use",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="TermsOfUseScreen"
      component={TermsOfUseScreen}
    />
    <Stack.Screen
      options={{
        title: "",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="OtherUserFriendsScreen"
      component={OtherUserFriendsScreen}
    />
    <Stack.Screen
      options={{
        title: "Edit post",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="EditPostScreen"
      component={EditPostScreen}
    />
    <Stack.Screen
      options={{
        title: "Followers Mode",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="FollowersModeScreen"
      component={FollowersModeScreen}
    />
    <Stack.Screen
      options={{
        title: "Ad Screen",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="AdScreen"
      component={AdScreen}
    />
    <Stack.Screen
      options={{
        title: "Video Screen",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
      }}
      name="Test"
      component={Test}
    />
  </Stack.Navigator>
);
export default MainStack;
