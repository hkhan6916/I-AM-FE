import { combineReducers } from "redux";
import { loggedInReducer, userDataReducer } from "./userReducer";
import {
  postCreatedReducer,
  updatedPostReducer,
  globalUnMuteVideosReducer,
} from "./postsReducer";
import cameraActivatedReducer from "./cameraReducer";

export default combineReducers({
  loggedIn: loggedInReducer,
  userData: userDataReducer,
  postCreated: postCreatedReducer,
  cameraActivated: cameraActivatedReducer,
  updatedPost: updatedPostReducer,
  globalUnMuteVideos: globalUnMuteVideosReducer,
});
