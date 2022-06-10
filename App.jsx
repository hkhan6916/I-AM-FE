import React, { useEffect } from "react";
import { Alert, LogBox } from "react-native";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "./src/reducers/rootReducer";

import Screens from "./src/screens";
import { enableScreens } from "react-native-screens";
import { getUsedMemorySync } from "react-native-device-info";
import PerformanceStats from "react-native-performance-stats";

const store = createStore(rootReducer);
const ignoreWarns = [
  "Setting a timer for a long period of time",
  "VirtualizedLists should never be nested inside plain ScrollViews with the same orientation",
  "ViewPropTypes will be removed",
  "AsyncStorage has been extracted from react-native",
  "EventEmitter.removeListener",
];

console.log(getUsedMemorySync() / 1000000000);
const warn = console.warn;
console.warn = (...arg) => {
  for (let i = 0; i < ignoreWarns.length; i++) {
    if (arg[0].startsWith(ignoreWarns[i])) return;
  }
  warn(...arg);
};

LogBox.ignoreLogs(ignoreWarns);

const App = () => {
  enableScreens();
  useEffect(() => {
    const listener = PerformanceStats.addListener((stats) => {
      console.log(stats);
    });

    // you must call .start(true) to get CPU as well
    PerformanceStats.start();

    // ... at some later point you could call:
    // PerformanceStats.stop();

    return () => listener.remove();
  }, []);
  return (
    <Provider store={store}>
      <Screens />
    </Provider>
  );
};

export default App;
