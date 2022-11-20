import { DeviceMotion } from "expo-sensors";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

const useOrientation = () => {
  const [orientation, setOrientation] = useState("portrait");
  useEffect(() => {
    (async () => {
      if ((await DeviceMotion.isAvailableAsync()) && Platform.OS === "ios") {
        let currentState = "portrait";
        DeviceMotion.addListener(({ _, orientation: rotated }) => {
          const newValue =
            rotated == -90
              ? "landscapeRight"
              : rotated == 90
              ? "landscapeLeft"
              : "portrait";
          // can't track state inside a event listener so need a local variable which is in sync with the actual state
          if (currentState !== newValue) {
            currentState =
              rotated == -90
                ? "landscapeRight"
                : rotated == 90
                ? "landscapeLeft"
                : "portrait";
            setOrientation(newValue);
          }
        });
      }
    })();
    return async () => {
      if (Platform.OS === "ios") DeviceMotion.removeAllListeners();
    };
  }, []);

  return orientation;
};

export default useOrientation;
