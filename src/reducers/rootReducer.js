import { combineReducers } from 'redux';
import loggedInReducer from './loggedInReducer';
import postCreatedReducer from './postsReducer';

export default combineReducers({
  loggedIn: loggedInReducer,
  postCreated: postCreatedReducer,
});
