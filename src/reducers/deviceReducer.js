export const canPlayFeedVideosReducer = (state = true, action) => {
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

export const isLowEndDeviceReducer = (state = true, action) => {
  switch (action.type) {
    case "SET_IS_LOW_END_DEVICE":
      return {
        ...state,
        state: action.payload,
      };
    default:
      return state;
  }
};
