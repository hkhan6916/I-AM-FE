import { FFmpegKit } from "ffmpeg-kit-react-native";

const convertVideoToMp4 = async (videoUri) => {
  if (!videoUri) return null;
  const filename = videoUri.replace(/^.*[\\\/]/, "");
  const baseDir = videoUri.split(filename)[0];
  const newFileName = `${filename.split(".")[0]}.mp4`;

  const outputUri = baseDir + newFileName;
  try {
    /**
     * FLAG: -pix_fmt yuv420p
     * URL: https://stackoverflow.com/questions/21184014/ffmpeg-converted-mp4-file-does-not-play-in-firefox-and-chrome
     * */
    await FFmpegKit.execute(
      `-i ${videoUri} -vcodec h264 -pix_fmt yuv420p -acodec copy ${outputUri}`
    );
  } catch (e) {
    throw new Error("Failed to convert the video");
  }

  return outputUri;
};

export default convertVideoToMp4;
