import { getItemAsync } from "expo-secure-store";
import Upload from "react-native-background-upload";
import apiCall from "./apiCall";

const backgroundUpload = async ({
  filePath,
  url,
  parameters,
  failureRoute,
  onComplete,
}) => {
  const options = {
    url,
    path: filePath, // path to file
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
  // compress in background and .then (()=>startupload)
  Upload.startUpload(options)
    .then((uploadId) => {
      console.log("Upload started");
      Upload.addListener("progress", uploadId, (data) => {
        console.log(`Progress: ${data.progress}%`);
        console.log(data);
      });
      Upload.addListener("error", uploadId, async (data) => {
        console.log({ data });
        console.log(`Error: ${data.error}%`);
        await apiCall("GET", failureRoute);
      });
      Upload.addListener("cancelled", uploadId, async (data) => {
        console.log(`Cancelled!`);
        await apiCall("GET", failureRoute);
      });
      Upload.addListener("completed", uploadId, (data) => {
        if (onComplete) {
          onComplete();
        }
        console.log(data);
        console.log("Completed!");
      });
    })
    .catch(async (err) => {
      console.log("Upload error!", err);
      await apiCall("GET", failureRoute);
    });
};

export default backgroundUpload;
