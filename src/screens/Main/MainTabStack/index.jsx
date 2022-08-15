import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector, useDispatch } from "react-redux";
import HomeScreen from "./Home";
import AddScreen from "./Add";
import ProfileScreen from "./Profile";
import SearchStack from "./Search";
import ContactsScreen from "./Contacts";
import themeStyle from "../../../theme.style";
import apiCall from "../../../helpers/apiCall";
import webPersistUserData from "../../../helpers/webPersistUserData";

const Tab = createBottomTabNavigator();

const MainTabStack = () => {
  const dispatch = useDispatch();

  const cameraActivated = useSelector((state) => state.cameraActivated);

  const getUserData = async () => {
    const { success, response } = await apiCall("GET", "/user/data");

    if (success) {
      dispatch({ type: "SET_USER_DATA", payload: response });
      webPersistUserData(response);
    }
  };
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      (async () => {
        await getUserData();
      })();
    }
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <Tab.Navigator
      initialRouteName="Home"
      detachInactiveScreens
      screenOptions={({ route }) => ({
        tabBarHideOnKeyboard: true,
        contentStyle: {
          backgroundColor: themeStyle.colors.grayscale.lowest,
        },
        tabBarActiveTintColor: themeStyle.colors.primary.default,
        tabBarInactiveTintColor: themeStyle.colors.grayscale.lowest,
        tabBarShowLabel: false,
        tabBarStyle: [
          {
            display: cameraActivated.state ? "none" : "flex",
            backgroundColor: themeStyle.colors.grayscale.highest,
            borderTopWidth: 0.5,
            borderTopColor: themeStyle.colors.grayscale.cardsOuter,
          },
          null,
        ],

        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Add") {
            iconName = "add";
          } else if (route.name === "Me") {
            iconName = "happy";
          } else if (route.name === "Search") {
            iconName = "search";
          } else if (route.name === "Contacts") {
            iconName = "people";
          }

          return (
            <Ionicons
              name={iconName}
              size={route.name === "Add" ? 35 : size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen headerShown name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Add" component={AddScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="Me" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
export default MainTabStack;
