import { FFmpegKit, FFmpegKitConfig } from "ffmpeg-kit-react-native";
import { Platform } from "react-native";
import { Video as VideoCompress } from "react-native-compressor";

/**
 * FLAG: -pix_fmt yuv420p
 * URL: https://stackoverflow.com/questions/21184014/ffmpeg-converted-mp4-file-does-not-play-in-firefox-and-chrome
 * */
const convertAndEncodeVideo = async ({
  uri,
  isProfileVideo,
  setProgress,
  videoDuration,
}) => {
  if (!uri) return null;
  /**
   * Android
   *
   * We simply compress as we will not be allowing hevc/h265 encoded video since it's rare and ffmpeg is does not run correctly in the background on android.
   */
  if (Platform.OS === "android") {
    const videoUri = await VideoCompress.compress(
      uri,
      {
        compressionMethod: isProfileVideo ? "manual" : "auto",
        minimumFileSizeForCompress: 0,
      },
      (progress) => {
        console.log({ pre_conversion_compression: progress });
      }
    ).catch((err) => {
      console.log(err);
      // TODO:maybe show notification here?
    });
    return videoUri;
  }

  /**
   * IOS
   *
   * We run ffmpeg since IOS devices likely has hevc/h265 videos. Since ffmpeg runs quite fast on IOS, we run it in the foreground. Running in background is not possible in a stable way for ffmpeg and neither for react-native-compressor package.
   */
  if (Platform.OS === "ios") {
    const oldFilename = uri.replace(/^.*[\\\/]/, "");
    const oldBaseDir = uri.split(oldFilename)[0];
    const oldNewFileName = `processed${oldFilename.split(".")[0]}.mp4`;
    let videoUri = oldBaseDir + oldNewFileName;

    try {
      await FFmpegKitConfig.enableStatistics();
      await FFmpegKitConfig.enableStatisticsCallback(async (statisticsData) => {
        const time = await statisticsData.getTime();
        if (videoDuration && setProgress && time) {
          const percentage = (100 * time) / videoDuration;
          const roundedPercentage = Math.round(percentage);
          if (roundedPercentage) {
            setProgress(roundedPercentage > 100 ? 100 : roundedPercentage);
          }
        }
      });

      await FFmpegKit.execute(
        `-y -i ${
          Platform.OS == "android" ? uri?.replace("file://", "") : uri
        } -c:v libx264 -r 5 -tune fastdecode -threads 2 -preset ultrafast -vf format=yuv420p -c:a copy ${videoUri}`
      );
    } catch (e) {
      console.error("Failed to convert the video");
    }

    return videoUri;
  }
  return null;
};

export default convertAndEncodeVideo;
