import { useState, useEffect } from "react";
import {
  getOrientationAsync,
  addOrientationChangeListener,
} from "expo-screen-orientation";

const useScreenOrientation = () => {
  const [orientation, setOrientation] = useState(0);

  useEffect(() => {
    getOrientationAsync().then((value) => {
      setOrientation(value);
    });

    const subscription = addOrientationChangeListener((event) => {
      setOrientation(event.orientationInfo.orientation);
    });

    return () => {
      subscription.remove();
    };
  }, []);
  if (orientation > 2) {
    return "LANDSCAPE";
  }
  return "PORTRAIT";
};

export default useScreenOrientation;
