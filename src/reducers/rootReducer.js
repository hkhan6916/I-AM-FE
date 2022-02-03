import { combineReducers } from "redux";
import { loggedInReducer, userDataReducer } from "./userReducer";
import postCreatedReducer from "./postsReducer";
import cameraActivatedReducer from "./cameraReducer";

export default combineReducers({
  loggedIn: loggedInReducer,
  userData: userDataReducer,
  postCreated: postCreatedReducer,
  cameraActivated: cameraActivatedReducer,
});
