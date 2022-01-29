import React from "react";
import { View, Modal, TouchableOpacity } from "react-native";
import FastImage from "react-native-fast-image";
import { AntDesign } from "@expo/vector-icons";
import themeStyle from "../theme.style";

const ImageWithCache = ({
  resizeMode,
  aspectRatio,
  mediaUrl,
  mediaIsSelfie,
  mediaOrientation,
  mediaHeaders,
  isFullScreen,
  toggleFullScreen,
  removeBorderRadius,
}) => (
  <View
    style={[
      {
        transform: [{ scaleX: mediaIsSelfie ? -1 : 1 }],
      },
    ]}
  >
    <View
      style={{
        transform: [
          {
            rotate:
              mediaOrientation === "landscape-left"
                ? "-90deg"
                : mediaOrientation === "landscape-right"
                ? "90deg"
                : "0deg",
          },
        ],
      }}
    >
      {isFullScreen ? (
        <Modal presentationStyle="pageSheet">
          <View
            style={{
              backgroundColor: themeStyle.colors.grayscale.black,
              flex: 1,
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 10,
              }}
            >
              <TouchableOpacity onPress={() => toggleFullScreen(false)}>
                <AntDesign
                  name="closecircleo"
                  size={24}
                  color={themeStyle.colors.grayscale.white}
                />
              </TouchableOpacity>
            </View>
            <FastImage
              resizeMode={FastImage.resizeMode.contain}
              source={{ uri: mediaUrl, headers: mediaHeaders || {} }}
              style={{
                borderRadius: removeBorderRadius ? 0 : 10,
                width: "100%",
                height: "100%",
              }}
            />
          </View>
        </Modal>
      ) : (
        <FastImage
          resizeMode={
            resizeMode === "cover"
              ? FastImage.resizeMode.cover
              : FastImage.resizeMode.contain
          }
          source={{ uri: mediaUrl, headers: mediaHeaders || {} }}
          style={{
            borderRadius: removeBorderRadius ? 0 : 10,
            aspectRatio,
            width: "100%",
          }}
        />
      )}
    </View>
  </View>
);

export default ImageWithCache;
