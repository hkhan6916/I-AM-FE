const canPlayFeedVideosReducer = (state = true, action) => {
  switch (action.type) {
    case "SET_CAN_PLAY_FEED_VIDEOS":
      return {
        ...state,
        state: action.payload,
      };
    default:
      return state;
  }
};

export default canPlayFeedVideosReducer;
