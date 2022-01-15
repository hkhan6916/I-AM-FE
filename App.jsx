import React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "./src/reducers/rootReducer";

import Screens from "./src/screens";

const store = createStore(rootReducer);

const App = () => (
  <Provider store={store}>
    <Screens />
  </Provider>
);

export default App;
