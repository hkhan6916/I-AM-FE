const postCreatedReducer = (state = false, action) => {
  switch (action.type) {
    case 'SET_POST_CREATED':
      return {
        ...state,
        state: action.payload,
      };
    default:
      return state;
  }
};

export default postCreatedReducer;
