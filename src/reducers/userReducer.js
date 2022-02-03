export const loggedInReducer = (state = false, action) => {
  switch (action.type) {
    case "SET_USER_LOGGED_IN":
      return {
        ...state,
        state: action.payload,
      };
    default:
      return state;
  }
};

export const userDataReducer = (state = {}, action) => {
  switch (action.type) {
    case "SET_USER_DATA":
      return {
        ...state,
        state: action.payload,
      };

    default:
      return state;
  }
};
