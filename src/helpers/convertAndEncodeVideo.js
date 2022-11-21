import { FFmpegKit, FFmpegKitConfig } from "ffmpeg-kit-react-native";
import { Alert, Platform } from "react-native";
import { Video as VideoCompress } from "react-native-compressor";
import { getInfoAsync } from "expo-file-system";
import getVideoCodecName from "./getVideoCodecName";
import { getRealPath } from "react-native-compressor";

export const basicFfmpegCompression = async (uri) => {
  if (!uri) {
    console.log("basicFfmpegCompression: No URI provided.");
    return null;
  }

  const realPath = await getRealPath(uri);

  const mediaInfo = await getInfoAsync(realPath);
  const mediaSizeInMb = mediaInfo?.size / 1000000;
  if (mediaSizeInMb >= 200) {
    Alert.alert(
      `Unable to process this video`,
      `This video is too large. Please choose or record another video.`,
      [
        {
          text: "Close",
        },
      ]
    );
    return;
  }

  // if small profile video, use ffmpeg compression
  const oldFilename = realPath.replace(/^.*[\\\/]/, "");
  const oldBaseDir = realPath.split(oldFilename)[0];
  const oldNewFileName = `processed${oldFilename}`;
  let resizedUri = oldBaseDir + oldNewFileName;

  await FFmpegKit.execute(
    `-y -i ${realPath?.replace(
      "file://",
      ""
    )} -vf "scale=trunc(iw/5)*2:trunc(ih/5)*2" -c:a copy ${resizedUri}`
  );

  return resizedUri;
};

/**
 * FLAG: -pix_fmt yuv420p
 * URL: https://stackoverflow.com/questions/21184014/ffmpeg-converted-mp4-file-does-not-play-in-firefox-and-chrome
 * */
export const convertAndEncodeVideo = async ({
  uri,
  isProfileVideo,
  setProgress,
  videoDuration,
  useFfmpeg = false,
  useStandardCompressor = false,
}) => {
  try {
    await FFmpegKit.cancel();
    if (!uri) {
      console.log("No URI provided.");
      return null;
    }

    const realPath = await getRealPath(uri);

    const mediaInfo = await getInfoAsync(realPath);
    const mediaSizeInMb = mediaInfo?.size / 1000000;
    if (mediaSizeInMb >= 200) {
      Alert.alert(
        `Unable to process this video`,
        `This video is too large. Please choose or record another video.`,
        [
          {
            text: "Close",
          },
        ]
      );
      return;
    }
    /**
     * Android
     *
     * We simply compress. We will not be allowing hevc/h265 encoded video since it's rarely stored on android phones. We run ffmpeg for larger files as it's faster but standard compressor for smaller files for improved quality and background running on android.
     * Why? Because react-native-compressor runs in the background but also gives better quality videos with manual compression. It also feels more reliable. But it's slow so we don't use it for large files.
     */
    if (Platform.OS === "android") {
      const encoding = await getVideoCodecName(realPath);

      // Checks if encoding is unsupported by standard compressor
      const requiresFFMPEG = ["aac"].includes(encoding);
      // if small profile video, use standard compression
      if (
        useStandardCompressor ||
        (!requiresFFMPEG &&
          ((mediaSizeInMb <= 25 && isProfileVideo) || !isProfileVideo) &&
          !useFfmpeg)
      ) {
        const videoUri = await VideoCompress.compress(
          realPath,
          {
            compressionMethod: isProfileVideo ? "manual" : "auto",
            minimumFileSizeForCompress: 0,
          },
          (progress) => {
            console.log({ android_compression: progress });
          }
        ).catch((err) => {
          console.log({ err });
          // TODO:maybe show notification here?
        });
        const exists = await getInfoAsync(videoUri);
        if (!exists) {
          return null;
        }

        return videoUri;
      }

      // if small profile video, use ffmpeg compression
      const videoUri = await basicFfmpegCompression(uri);
      const exists = await getInfoAsync(videoUri);
      if (!exists) {
        return null;
      }
      return videoUri;
    }

    /**
     * IOS
     *
     * We run ffmpeg since IOS devices likely has hevc/h265 videos. Since ffmpeg runs quite fast on IOS, we run it in the foreground. Running in background is not possible in a stable way for ffmpeg and neither for react-native-compressor package.
     */
    if (Platform.OS === "ios") {
      const oldFilename = realPath.replace(/^.*[\\\/]/, "");
      const oldBaseDir = realPath.split(oldFilename)[0];
      const oldNewFileName = `processed${oldFilename.split(".")[0]}.mp4`;
      let videoUri = oldBaseDir + oldNewFileName;

      try {
        await FFmpegKitConfig.enableStatistics();
        await FFmpegKitConfig.enableStatisticsCallback(
          async (statisticsData) => {
            const time = await statisticsData.getTime();
            if (videoDuration && setProgress && time) {
              const percentage = (100 * time) / videoDuration;
              const roundedPercentage = Math.round(percentage);
              if (roundedPercentage) {
                setProgress(roundedPercentage > 100 ? 100 : roundedPercentage);
              }
            }
          }
        );

        await FFmpegKit.execute(
          `-y -i ${
            Platform.OS == "android"
              ? realPath?.replace("file://", "")
              : realPath
          } -c:v libx264 -crf ${
            isProfileVideo ? "28" : "36"
          } -preset ultrafast -vf format=yuv420p -c:a copy ${videoUri}`
        );
      } catch (e) {
        console.error("Failed to convert the video");
      }

      return videoUri;
    }
    return null;
  } catch (err) {
    console.log({ err });
    if (!useFfmpeg && Platform.OS === "android") {
      convertAndEncodeVideo({
        uri,
        isProfileVideo,
        setProgress,
        videoDuration,
        useFfmpeg: true,
      });
    }
  }
};
