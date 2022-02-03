import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FriendsScreen from "./Friends";
import FriendRequestsScreen from "./FriendRequests";

const Stack = createNativeStackNavigator();

const FriendsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
    initialRouteName="FriendsScreen"
  >
    <Stack.Screen name="FriendsScreen" component={FriendsScreen} />
    <Stack.Screen
      name="FriendRequestsScreen"
      component={FriendRequestsScreen}
    />
  </Stack.Navigator>
);
export default FriendsStack;
