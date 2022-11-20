import { FFprobeKit } from "ffmpeg-kit-react-native";
import { getRealPath } from "react-native-compressor";

const getVideoCodecName = async (uri) => {
  if (!uri) return;
  const realpath = await getRealPath(uri);
  try {
    const codec = await FFprobeKit.getMediaInformationFromCommand(
      "-v quiet -hide_banner -print_format json -show_format -show_entries stream=index,codec_name,channels:stream_tags=language -show_chapters -i " +
        realpath.replace("file://", "")
    ).then(async (information) => {
      return JSON.parse(await information.getLogsAsString()).streams[0]
        ?.codec_name;
    });
    return codec;
  } catch (err) {
    console.log(err);
  }
};
export default getVideoCodecName;
