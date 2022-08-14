import { useEffect, useState } from "react";
import { Platform } from "react-native";

const usePersistedWebParams = (newParams = {}) => {
  const [params, setParams] = useState({});
  useEffect(() => {
    if (Platform.OS === "web") {
      const persistedData = localStorage.getItem("params") || "{}";
      // params have values meaning no refresh, so we store it in localstorage
      if (newParams[Object.keys(newParams)[0]] !== "[object Object]") {
        console.log("hey");
        localStorage.setItem("params", JSON.stringify(newParams));
      }
      setParams(JSON.parse(persistedData));
    }
  }, [newParams]);
  return params;
};

export default usePersistedWebParams;
