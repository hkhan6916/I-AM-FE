import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ContactsScreen from "./Contacts";
import ContactRequestsScreen from "./ContactRequests";
import themeStyle from "../../../../theme.style";

const Stack = createNativeStackNavigator();
const ContactsStack = () => (
  <Stack.Navigator initialRouteName="ContactsScreen">
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
      name="ContactsScreen"
      component={ContactsScreen}
    />
    <Stack.Screen
      name="ContactRequestsScreen"
      component={ContactRequestsScreen}
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

export default ContactsStack;
