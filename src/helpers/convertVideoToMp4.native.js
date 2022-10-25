import { FFmpegKit } from "ffmpeg-kit-react-native";
import { Platform } from "react-native";
import { Video as VideoCompress } from "react-native-compressor";

/**
 * FLAG: -pix_fmt yuv420p
 * URL: https://stackoverflow.com/questions/21184014/ffmpeg-converted-mp4-file-does-not-play-in-firefox-and-chrome
 * */
const convertVideoToMp4 = async (uri) => {
  if (!uri) return null;
  let videoUri = await VideoCompress.compress(
    uri,
    {
      compressionMethod: "auto",
      minimumFileSizeForCompress: 10,
    },
    (progress) => {
      console.log({ compression: progress });
    }
  );

  if (!videoUri) return;

  videoUri =
    Platform.OS == "android" ? videoUri?.replace("file://", "") : videoUri;

  const filename = videoUri.replace(/^.*[\\\/]/, "");
  const baseDir = videoUri.split(filename)[0];
  const newFileName = `${filename.split(".")[0]}.mp4`;

  const outputUri = baseDir + newFileName;
  try {
    await FFmpegKit.execute(
      Platform.OS === "ios"
        ? `-i ${videoUri} -c:v h264_videotoolbox -pix_fmt yuv420p -b:v 3000k -acodec copy ${outputUri}`
        : `-i ${videoUri} -vcodec h264 -pix_fmt yuv420p -acodec copy ${outputUri}`
    );
  } catch (e) {
    throw new Error("Failed to convert the video");
  }

  return outputUri;
};

export default convertVideoToMp4;
