import { FFmpegKit } from "ffmpeg-kit-react-native";
import { Video as VideoCompress } from "react-native-compressor";
import getVideoCodecName from "./getVideoCodecName";

/**
 * FLAG: -pix_fmt yuv420p
 * URL: https://stackoverflow.com/questions/21184014/ffmpeg-converted-mp4-file-does-not-play-in-firefox-and-chrome
 * */
const convertAndEncodeVideo = async (uri, isProfileVideo) => {
  if (!uri) return null;

  // compress video
  let videoUri = await VideoCompress.compress(
    uri,
    {
      compressionMethod: isProfileVideo ? "manual" : "auto",
      minimumFileSizeForCompress: 0,
    },
    (progress) => {
      console.log({ pre_conversionmp4_compression: progress });
    }
  );

  if (!videoUri) return;

  // videoUri =
  //   Platform.OS == "android" ? videoUri?.replace("file://", "") : videoUri;

  const filename = videoUri.replace(/^.*[\\\/]/, "");
  const baseDir = videoUri.split(filename)[0];
  const newFileName = `processed${filename.split(".")[0]}.mp4`;
  const outputUri = baseDir + newFileName;

  const codec = await getVideoCodecName(videoUri);

  //check codec and make sure it is not hevc or h265.
  const unsupportedCodec = codec === "hevc" || codec === "h265" || !codec;

  // convert to h264 if unsupported codec or codec not found
  console.log(
    `VIDEO CODEC ${codec || ""} IS UNSUPPORTED RUNNING FFMPEG CONVERSION`
  );
  if (unsupportedCodec) {
    try {
      await FFmpegKit.execute(
        `-y -i ${videoUri} -map 0 -map -0:d -c:v libx264 -crf 18 -preset ultrafast -vf format=yuv420p -c:a copy ${outputUri}`
      );
    } catch (e) {
      throw new Error("Failed to convert the video");
    }
    return outputUri;
  }

  return videoUri;
};

export default convertAndEncodeVideo;
