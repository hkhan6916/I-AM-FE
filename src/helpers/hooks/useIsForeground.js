import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export const useIsForeground = () => {
  const [isForeground, setIsForeground] = useState(true);

  useEffect(() => {
    const onChange = (state) => {
      setIsForeground(state === "active");
    };
    const listener = AppState.addEventListener("change", onChange);
    return () => listener.remove();
  }, [setIsForeground]);

  return isForeground;
};