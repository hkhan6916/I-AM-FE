export const postCreatedReducer = (state = false, action) => {
  switch (action.type) {
    case "SET_POST_CREATED":
      return {
        ...state,
        state: action.payload,
      };
    default:
      return state;
  }
};

export const updatedPostReducer = (state = null, action) => {
  switch (action.type) {
    case "SET_UPDATED_POST":
      return {
        ...state,
        state: action.payload,
      };
    default:
      return state;
  }
};

export const globalUnMuteVideosReducer = (state = null, action) => {
  switch (action.type) {
    case "SET_GLOBAL_UNMUTE_VIDEOS":
      return {
        ...state,
        state: action.payload,
      };
    default:
      return state;
  }
};
