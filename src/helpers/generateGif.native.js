import { FFmpegKit } from "ffmpeg-kit-react-native";
import { Platform } from "react-native";
import { Video as VideoCompress } from "react-native-compressor";

const generateGif = async (uri) => {
  if (!uri) return null;

  // We need to call this as we don't use aggressive compression on profile videos. We only call this if file size is larger than 5mb.
  let videoUri = await VideoCompress.compress(
    Platform.OS == "android" ? uri?.replace("file://", "") : uri,
    {
      compressionMethod: "auto",
      minimumFileSizeForCompress: 5,
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
