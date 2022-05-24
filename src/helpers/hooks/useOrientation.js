import { DeviceMotion } from "expo-sensors";
import { useEffect, useState } from "react";
import { Dimensions, Platform } from "react-native";

function useOrientation() {
  const [orientation, setOrientation] = useState("portrait");

  useEffect(() => {
    (async () => {
      if ((await DeviceMotion.isAvailableAsync()) && Platform.OS === "ios") {
        DeviceMotion.addListener(({ rotation: { beta, gamma } }) => {
          let absGamma = Math.abs(gamma);
          let absBeta = Math.abs(beta);
          let rotate = 0;

          if (absGamma <= 0.04 && absBeta <= 0.24) {
            // Portrait mode, on a flat surface.
            rotate = "portrait";
          } else if ((absGamma <= 1.0 || absGamma >= 2.3) && absBeta >= 0.5) {
            // General Portrait mode, accounting for forward and back tilt on the top of the phone.
            rotate = "portrait";
          } else {
            if (gamma < 0) {
              // Landscape mode with the top of the phone to the left.
              rotate = "landscapeRight";
            } else {
              // Landscape mode with the top of the phone to the right.
              rotate = "landscapeLeft";
            }
          }

          if (rotate !== orientation) {
            setOrientation(rotate);
          }
        });
      }
    })();
    return async () => {
      if (Platform.OS === "ios") DeviceMotion.removeAllListeners();
    };
  }, []);

  return orientation;
}

export default useOrientation;
