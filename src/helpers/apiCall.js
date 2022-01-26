import axios from "axios";
import { getItemAsync } from "expo-secure-store";

const apiCall = async (method, route, payload = null) => {
  const apiUrl = "http://192.168.5.101:5000";
  // const apiUrl = 'https://i-am-be.herokuapp.com';
  const callConfig = {
    method,
    url: `${apiUrl}${route}`,
    data: payload,
    headers: {},
  };

  try {
    const token = await getItemAsync("authToken");
    if (token) {
      callConfig.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    callConfig.headers.Authorization = `Bearer ${null}`;
  }

  if (payload !== null) {
    callConfig.headers["Content-Type"] = "application/json";
  }

  if (payload instanceof FormData) {
    callConfig.headers["Content-Type"] = "multipart/form-data";
  }
  try {
    const { data: response } = await axios(callConfig);
    const { message, error, success, data, other } = response;
    return {
      success,
      message,
      response: data || null,
      error: error || null,
      other: other || null,
    };
  } catch (e) {
    if (e.response) {
      const { status, data: response } = e.response;
      const { message, success } = response;

      return {
        success,
        message,
        response: message ?? "",
        error: message ?? "",
      };
    }
    return {
      success: false,
      message: "Couldn't connect to server",
      response: "",
      error: "CONNECTION_FAILED",
    };
  }
};

export default apiCall;
