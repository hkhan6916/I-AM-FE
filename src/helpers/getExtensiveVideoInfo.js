import { FFprobeKit } from "ffmpeg-kit-react-native";
import { getRealPath } from "react-native-compressor";

const getExtensiveVideoInfo = async (uri = "") => {
  if (!uri) return;
  const realPath = uri.includes("file:/") ? uri : await getRealPath(uri);
  try {
    const info = await FFprobeKit.getMediaInformationFromCommand(
      "-v quiet -hide_banner -print_format json -show_format -show_entries stream=width,height,index,codec_name,channels:stream_tags=language -show_chapters -i " +
        realPath.replace("file://", "")
    ).then(async (information) => {
      return JSON.parse(await information.getLogsAsString()).streams[0];
    });
    return info;
  } catch (err) {
    console.log(err);
  }
};
export default getExtensiveVideoInfo;
