import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import themeStyle from "../../../theme.style";

const Stack = createNativeStackNavigator();

const FriendsStack = () => (
  <Stack.Navigator
    initialRouteName="Step1"
    screenOptions={{
      headerStyle: {
        elevation: 0,
        backgroundColor: themeStyle.colors.grayscale.highest,
      },
    }}
  >
    <Stack.Screen
      options={{
        headerShown: false,
      }}
      name="Step1"
      component={Step1}
    />
    <Stack.Screen
      options={{
        headerShown: true,
        title: "Login info",
        headerTintColor: themeStyle.colors.primary.default,
      }}
      name="Step2"
      component={Step2}
    />
    <Stack.Screen
      options={{
        headerShown: true,
        title: "Profile Video",
        headerTintColor: themeStyle.colors.primary.default,
      }}
      name="Step3"
      component={Step3}
    />
  </Stack.Navigator>
);
export default FriendsStack;
