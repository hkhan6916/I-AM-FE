import { FFmpegKit, FFprobeKit } from "ffmpeg-kit-react-native";
import { Platform } from "react-native";
import { Video as VideoCompress } from "react-native-compressor";

/**
 * FLAG: -pix_fmt yuv420p
 * URL: https://stackoverflow.com/questions/21184014/ffmpeg-converted-mp4-file-does-not-play-in-firefox-and-chrome
 * */
const convertVideoToMp4 = async (uri, isProfileVideo, minCompress) => {
  if (!uri) return null;
  let videoUri = uri;

  /**
   * So ffmpeg command below works on android but videos encoded in h265/hevc can still be in format of mp4. Need to figure out how to check if video is in this format and THEN run the ffmpeg command.
   */

  // let videoUri = await VideoCompress.compress(
  //   uri,
  //   {
  //     compressionMethod: isProfileVideo ? "manual" : "auto",
  //     minimumFileSizeForCompress: 0,
  //   },
  //   (progress) => {
  //     console.log({ compression: progress });
  //   }
  // );

  if (!videoUri) return;

  // videoUri =
  //   Platform.OS == "android" ? videoUri?.replace("file://", "") : videoUri;

  const filename = videoUri.replace(/^.*[\\\/]/, "");
  const baseDir = videoUri.split(filename)[0];
  const newFileName = `processed${filename.split(".")[0]}.mp4`;
  const outputUri = baseDir + newFileName;

  try {
    await FFmpegKit.execute(
      `-y -i ${videoUri} -map 0 -map -0:d -c:v libx264 -crf 18 -preset ultrafast -vf format=yuv420p -c:a copy ${outputUri}`
    );
  } catch (e) {
    throw new Error("Failed to convert the video");
  }

  return outputUri;
};

export default convertVideoToMp4;
