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
import OtherUserContactsScreen from "./SubScreens/OtherUserContactsScreen";
import EditPostScreen from "./SubScreens/EditPostScreen";
import AccountScreen from "./SubScreens/AccountScreen";
import FollowersModeScreen from "./SubScreens/FollowersModeScreen";
import AccountVisibilityScreen from "./SubScreens/AccountVisibilityScreen";
import EmailVerificationScreen from "./SubScreens/EmailVerificationScreen";
import { Dimensions } from "react-native";

const Stack = createNativeStackNavigator();

const MainStack = () => {
  const screenWidth = Dimensions.get("window").width;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { elevation: 0, backgroundColor: "red" },
        cardStyle: { backgroundColor: themeStyle.colors.grayscale.highest },
        ...(screenWidth > 900 // Check this against tablets not using the web
          ? {
              contentStyle: {
                maxWidth: 900,
                justifyContent: "center",
                width: "100%",
                alignSelf: "center",
              },
            }
          : {}),
      }}
      initialRouteName="MainTabStack"
    >
      <Stack.Screen
        options={{
          headerShown: false,
          contentStyle: {
            maxWidth: screenWidth,
          },
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
          contentStyle: {
            maxWidth: screenWidth,
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
          contentStyle: {
            maxWidth: screenWidth,
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
          contentStyle: {
            maxWidth: screenWidth,
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
          contentStyle: {
            maxWidth: screenWidth,
          },
        }}
        name="CommentRepliesScreen"
        component={CommentsRepliesScreen}
      />
      <Stack.Screen
        options={{
          headerTintColor: themeStyle.colors.grayscale.lowest,
          title: "",
          headerShown: true,
          headerStyle: {
            backgroundColor: themeStyle.colors.grayscale.highest,
          },
          contentStyle: {
            maxWidth: screenWidth,
          },
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
          contentStyle: {
            maxWidth: screenWidth,
          },
        }}
        name="ChatScreen"
        component={ChatScreen}
      />
      <Stack.Screen
        options={{
          title: "Chats",
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
          title: "New Chat",
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
          contentStyle: {
            maxWidth: screenWidth,
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
        name="OtherUserContactsScreen"
        component={OtherUserContactsScreen}
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
          contentStyle: {
            maxWidth: screenWidth,
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
          title: "Account Visibility",
          headerShown: true,
          headerTintColor: themeStyle.colors.primary.default,
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerStyle: {
            backgroundColor: themeStyle.colors.grayscale.highest,
          },
        }}
        name="AccountVisibilityScreen"
        component={AccountVisibilityScreen}
      />
      <Stack.Screen
        options={{
          title: "Email Verification",
          headerShown: true,
          headerTintColor: themeStyle.colors.primary.default,
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerStyle: {
            backgroundColor: themeStyle.colors.grayscale.highest,
          },
        }}
        name="EmailVerificationScreen"
        component={EmailVerificationScreen}
      />
    </Stack.Navigator>
  );
};
export default MainStack;
