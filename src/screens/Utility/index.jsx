import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import themeStyle from "../../theme.style";
import ConnectionFailedScreen from "./ConnectionFailedScreen";

// main screen is connection failed but can add other utility screens here to show if needed.
const Stack = createNativeStackNavigator();
const UtilityScreens = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        elevation: 0,
        backgroundColor: themeStyle.colors.grayscale.highest,
      },
      cardStyle: { backgroundColor: themeStyle.colors.grayscale.highest },
    }}
    initialRouteName="ConnectionFailedScreen"
  >
    <Stack.Screen
      name="ConnectionFailedScreen"
      options={{ headerShown: false }}
      component={ConnectionFailedScreen}
    />
  </Stack.Navigator>
);
export default UtilityScreens;
