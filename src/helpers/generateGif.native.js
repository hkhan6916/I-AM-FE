import { FFmpegKit } from "ffmpeg-kit-react-native";

const generateGif = async (videoUri) => {
  if (!videoUri) return null;
  const filename = videoUri.replace(/^.*[\\\/]/, "");
  const baseDir = videoUri.split(filename)[0];
  const newFileName = `${filename.split(".")[0]}.gif`;

  const outputUri = baseDir + newFileName;
  try {
    await FFmpegKit.execute(
      `-i ${videoUri} -vf "scale=320:-1:flags=lanczos,fps=3" ${outputUri}`
    );
  } catch (e) {
    throw new Error("Failed to convert the video");
  }

  return outputUri;
};

export default generateGif;
