import React from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import themeStyle from "../theme.style";
import Image from "./Image";

const ImageWithCache = ({
  resizeMode = "contain",
  aspectRatio,
  mediaUrl,
  mediaIsSelfie,
  mediaHeaders,
  isFullScreen,
  toggleFullScreen,
  removeBorderRadius,
  onLoad,
  onError,
  removeBackround,
  style,
  background,
}) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const fullScreenWebStyles =
    Platform.OS === "web" ? { objectFit: "contain" } : {};

  const platformProps =
    Platform.OS === "web"
      ? {
          webProps: {
            style: {
              borderRadius: removeBorderRadius ? 0 : 10,
              width: "100%",
              objectFit: resizeMode,
              ...(aspectRatio
                ? { aspectRatio: aspectRatio }
                : { width: "100%", maxWidth: 900 }),
              ...style,
            },
          },
        }
      : {
          mobileProps: {
            style: [
              {
                borderRadius: removeBorderRadius ? 0 : 10,
                height: "100%",
              },
              aspectRatio
                ? { aspectRatio: aspectRatio }
                : { width: screenWidth },
              style && style,
            ],
            resizeMode: resizeMode,
          },
        };

  if (isFullScreen) {
    return (
      <Modal
        presentationStyle="pageSheet"
        onRequestClose={() => isFullScreen && toggleFullScreen()}
      >
        <View
          style={{
            backgroundColor: themeStyle.colors.black,
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
            <TouchableOpacity
              onPress={() => toggleFullScreen(false)}
              style={{ height: 48, width: 48, alignItems: "flex-end" }}
            >
              <AntDesign
                name="close"
                size={30}
                color={themeStyle.colors.white}
                style={{
                  color: themeStyle.colors.white,
                  textShadowOffset: {
                    width: 1,
                    height: 1,
                  },
                  textShadowRadius: 8,
                  textShadowColor: themeStyle.colors.black,
                }}
              />
            </TouchableOpacity>
          </View>
          <Image
            onError={() => {
              if (onError) {
                onError();
              }
            }}
            resizeMode={"contain"}
            source={{ uri: mediaUrl, headers: mediaHeaders || {} }}
            style={{
              borderRadius: removeBorderRadius ? 0 : 10,
              width: "100%",
              height: "100%",
              maxHeight: screenHeight,
              maxWidth: screenWidth,
              ...fullScreenWebStyles,
            }}
          />
        </View>
      </Modal>
    );
  }

  return (
    <View
      style={[
        {
          transform: [{ scaleX: mediaIsSelfie ? -1 : 1 }],
        },
      ]}
    >
      <View
        style={{
          backgroundColor:
            !removeBackround && !background
              ? themeStyle.colors.grayscale.higher
              : background,
        }}
      >
        <Image
          onError={() => {
            if (onError) {
              onError();
            }
          }}
          onLoad={(e) => {
            if (onLoad) {
              onLoad(e);
            }
          }}
          source={{
            uri: mediaUrl,
            headers: mediaHeaders || {},
          }}
          // not using conditional with Platform.OS here for simplicity and less logic
          {...platformProps}
        />
      </View>
    </View>
  );
};

export default React.memo(ImageWithCache);
