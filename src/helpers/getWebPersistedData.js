import { Platform } from "react-native";

const getWebPersistedUserData = () => {
  if (Platform.OS === "web") {
    const data = localStorage.getItem("userData");

    return JSON.parse(data);
  }
};

export default getWebPersistedUserData;
