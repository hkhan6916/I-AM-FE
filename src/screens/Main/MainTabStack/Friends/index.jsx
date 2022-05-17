import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FriendsScreen from "./Friends";
import FriendRequestsScreen from "./FriendRequests";
import themeStyle from "../../../../theme.style";

const Stack = createNativeStackNavigator();
const FriendsStack = () => (
  <Stack.Navigator initialRouteName="FriendsScreen">
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
        title: "Contacts",
      }}
      name="FriendsScreen"
      component={FriendsScreen}
    />
    <Stack.Screen
      name="FriendRequestsScreen"
      component={FriendRequestsScreen}
      options={{
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerStyle: {
          backgroundColor: themeStyle.colors.grayscale.highest,
        },
        title: "Requests",
      }}
    />
  </Stack.Navigator>
);

export default FriendsStack;
