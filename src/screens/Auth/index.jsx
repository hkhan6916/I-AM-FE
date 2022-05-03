import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./Login";
import RegisterStack from "./Register";
import ForgotPasswordScreen from "./ForgotPasswordScreen";
import themeStyle from "../../theme.style";

const Stack = createNativeStackNavigator();
const AuthScreens = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        elevation: 0,
        backgroundColor: themeStyle.colors.grayscale.highest,
      },
      cardStyle: { backgroundColor: themeStyle.colors.grayscale.highest },
    }}
  >
    <Stack.Screen
      name="Login"
      options={{ headerShown: false }}
      component={LoginScreen}
    />
    <Stack.Screen
      name="Register"
      options={{ headerShown: false }}
      component={RegisterStack}
    />
    <Stack.Screen
      options={{
        title: "Forgot Password",
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
      name="ForgotPasswordScreen"
      component={ForgotPasswordScreen}
    />
  </Stack.Navigator>
);
export default AuthScreens;
