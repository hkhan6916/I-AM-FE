// import Upload from "react-native-background-upload";
import apiCall from "./apiCall";
import { uploadAsync, FileSystemUploadType } from "expo-file-system";
import { Platform } from "react-native";
import { getRealPath } from "react-native-compressor";
const backgroundUpload = async ({
  filePath,
  url,
  parameters,
  failureRoute,
  onComplete,
  disableLogs,
}) => {
  const realFilePath = await getRealPath(filePath);
  const options = {
    url,
    path:
      Platform.OS == "android"
        ? realFilePath.replace("file://", "")
        : realFilePath,
    method: "PUT",
    type: "raw",
    maxRetries: 2, // set retry count (Android only). Default 2
    parameters,
    field: "file",
    // Below are options only supported on Android
    notification: {
      enabled: false,
    },
    useUtf8Charset: true,
    // customUploadId: post?._id,
  };
  try {
    const response = await uploadAsync(options.url, options.path, {
      fieldName: "file",
      httpMethod: options.method,
      uploadType: FileSystemUploadType.BINARY_CONTENT,
    });
    if (response.status) {
      if (response.status === 200) {
        if (onComplete) {
          onComplete();
        }
        if (!disableLogs) {
          console.log("Completed!");
        }
      } else {
        await apiCall("GET", failureRoute);
      }
    }
    if (!response.status) {
      if (onComplete) {
        onComplete();
      }
      if (!disableLogs) {
        console.log("Completed!");
      }
    }
  } catch (err) {
    if (!disableLogs) {
      console.log("Upload error!", err);
    }
    await apiCall("GET", failureRoute);
  }
};

export default backgroundUpload;
