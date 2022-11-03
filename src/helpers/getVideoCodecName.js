import { FFprobeKit } from "ffmpeg-kit-react-native";

const getVideoCodecName = async (uri) => {
  if (!uri) return;
  try {
    const codec = await FFprobeKit.getMediaInformationFromCommand(
      "-v quiet -hide_banner -print_format json -show_format -show_entries stream=index,codec_name,channels:stream_tags=language -show_chapters -i " +
        uri.replace("file://", "")
    ).then(async (information) => {
      return JSON.parse(await information.getLogsAsString()).streams[0]
        .codec_name;
    });
    return codec;
  } catch (err) {
    console.log(err);
  }
};
export default getVideoCodecName;
