import React from "react";
import { Alert, LogBox } from "react-native";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "./src/reducers/rootReducer";

import Screens from "./src/screens";
import { enableScreens } from "react-native-screens";

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

const App = () => {
  enableScreens();

  return (
    <Provider store={store}>
      <Screens />
    </Provider>
  );
};

export default App;
