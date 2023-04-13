import React, { useEffect } from "react";
import { LogBox } from "react-native";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "./src/reducers/rootReducer";

import Screens from "./src/screens";
import { enableScreens } from "react-native-screens";
// import PerformanceStats from "react-native-performance-stats";
import { Platform } from "react-native";
import { createBrowserApp } from "@react-navigation/web";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import "react-native-url-polyfill/auto";

const store = createStore(rootReducer);
const ignoreWarns = [
  "Setting a timer for a long period of time",
  "VirtualizedLists should never be nested inside plain ScrollViews with the same orientation",
  "ViewPropTypes will be removed",
  "AsyncStorage has been extracted from react-native",
  "EventEmitter.removeListener",
];

const warn = console.warn;
console.warn = (...arg) => {
  for (let i = 0; i < ignoreWarns.length; i++) {
    if (arg[0].startsWith(ignoreWarns[i])) return;
  }
  warn(...arg);
};

LogBox.ignoreLogs(ignoreWarns);

const createApp = Platform.select({
  web: (config) => createBrowserApp(config, { history: "hash" }),
  default: (config) => createAppContainer(config),
});

const ScreenNav = createApp(
  createSwitchNavigator({
    Main: Screens,
  })
);

const App = () => {
  enableScreens();
  useEffect(() => {
    // const listener = PerformanceStats.addListener((stats) => {
    //   // console.log(stats); // STATS
    // });
    // // you must call .start(true) to get CPU as well
    // PerformanceStats.start();
    // // ... at some later point you could call:
    // // PerformanceStats.stop();
    // return () => listener.remove();
  }, []);
  return (
    <Provider store={store}>
      <ScreenNav />
    </Provider>
  );
};

export default App;

// export default App;
