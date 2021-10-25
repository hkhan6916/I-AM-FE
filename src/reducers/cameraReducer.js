const cameraActivatedReducer = (state = false, action) => {
  switch (action.type) {
    case 'SET_CAMERA_ACTIVATED':
      return {
        ...state,
        state: action.payload,
      };
    default:
      return state;
  }
};

export default cameraActivatedReducer;
