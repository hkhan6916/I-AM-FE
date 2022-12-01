import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, TouchableOpacity } from "react-native";
import { cancelAnimation, useSharedValue } from "react-native-reanimated";
import themeStyle from "../theme.style";
import { Feather } from "@expo/vector-icons";

const _CaptureButton = ({
  camera,
  onMediaCaptured,
  flash,
  setRecording,
  disableVideo,
  cancelled,
  style,
}) => {
  const isRecording = useRef(false);
  const [isVideo, setIsVideo] = useState(false);
  const [type, setType] = useState("");
  const [file, setFile] = useState(null);

  const recordingProgress = useSharedValue(0);
  const takePhotoOptions = useMemo(
    () => ({
      photoCodec: "jpeg",
      qualityPrioritization: "speed",
      flash: flash,
      quality: 90,
      skipMetadata: true,
    }),
    [flash]
  );

  //#region Camera Capture
  const takePhoto = useCallback(async () => {
    try {
      if (camera.current == null) throw new Error("Camera ref is null!");

      console.log("Taking photo...");
      const photo = await camera.current.takePhoto(takePhotoOptions);
      setFile(photo);
      setType("photo");
    } catch (e) {
      console.error("Failed to take photo!", e);
    }
  }, [camera, onMediaCaptured, takePhotoOptions]);

  const onStoppedRecording = useCallback(() => {
    isRecording.current = false;
    cancelAnimation(recordingProgress);
    console.log("stopped recording video!");
  }, [recordingProgress]);
  const stopRecording = useCallback(async () => {
    try {
      if (camera.current == null) return; //throw new Error("Camera ref is null!");
      console.log("calling stopRecording()...");
      setRecording(false);
      await camera.current.stopRecording();
      console.log("called stopRecording()!");
    } catch (e) {
      console.error("failed to stop recording!", e);
    }
  }, [camera]);
  const startRecording = useCallback(() => {
    try {
      if (camera.current == null) return; //throw new Error("Camera ref is null!");
      setRecording(true);
      camera.current.startRecording({
        flash: flash,
        onRecordingError: (error) => {
          console.error("Recording failed!", error);
          onStoppedRecording();
        },
        onRecordingFinished: (video) => {
          console.log(`Recording successfully finished! ${video.path}`);
          setFile(video);
          setType("video");
          onStoppedRecording();
        },
      });
      isRecording.current = true;
    } catch (e) {
      console.error("failed to start recording!", e, "camera");
    }
  }, [camera, flash, onMediaCaptured, onStoppedRecording]);

  useEffect(() => {
    if (!cancelled && file && type) {
      onMediaCaptured(file, type);
      isRecording.current = false;
      setRecording(false);
    }

    if (cancelled) {
      isRecording.current = false;
      setRecording(false);
    }
  }, [file, type, cancelled, onMediaCaptured]);

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          justifyContent: "center",
        },
        style.captureButton,
      ]}
    >
      <TouchableOpacity
        onPress={() =>
          isVideo
            ? isRecording.current
              ? stopRecording()
              : startRecording()
            : takePhoto()
        }
      >
        <View
          style={{
            borderWidth: 5,
            borderColor: themeStyle.colors.white,
            borderRadius: 50,
            height: 60,
            width: 60,
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 20,
          }}
        >
          {isVideo ? (
            <View
              style={{
                backgroundColor: themeStyle.colors.error.default,
                height: isRecording.current ? 20 : 40,
                width: isRecording.current ? 20 : 40,
                borderRadius: isRecording.current ? 5 : 40,
              }}
            />
          ) : null}
        </View>
      </TouchableOpacity>
      {/* We have some login in captureMode styles so passing down those styles as it prevents some repetition*/}
      {!disableVideo ? (
        <TouchableOpacity
          onPress={() => setIsVideo(!isVideo)}
          style={[style.captureMode, { height: 48, width: 48 }]}
        >
          <View
            style={[
              {
                height: 40,
                width: 40,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 30,
                backgroundColor: themeStyle.colors.white,
              },
            ]}
          >
            <Feather
              name={isVideo ? "camera" : "video"}
              size={24}
              color={themeStyle.colors.black}
            />
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export const CaptureButton = React.memo(_CaptureButton);
