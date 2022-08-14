import { Platform } from "react-native";

const webPersistUserData = (userData = {}) => {
  if (Platform.OS === "web") {
    localStorage.setItem("userData", JSON.stringify(userData));
  }
};

export default webPersistUserData;
