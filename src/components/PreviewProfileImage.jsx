import { Dimensions, Platform, View } from "react-native";
import themeStyle from "../theme.style";
import Image from "./Image";
const PreviewProfileImage = ({ url, headers }) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  return (
    <View
      style={{
        width: screenWidth,
        maxWidth: 900,
        justifyContent: "center",
        maxHeight: 600,
        height: screenWidth - 5,
      }}
    >
      <Image
        source={{ uri: url, headers }}
        style={{
          width: screenWidth - 5,
          height: screenWidth - 5,
          maxWidth: 900 - 5,
          alignSelf: "center",
          borderRadius: 5,
          borderWidth: 2,
          borderColor: themeStyle.colors.grayscale.lowest,
          ...(Platform.OS === "web"
            ? {
                width: screenWidth,
                height: screenWidth,
                maxWidth: 600,
                maxHeight: 600,
                alignItems: "center",
                objectFit: "cover",
              }
            : {}),
        }}
      />
    </View>
  );
};

export default PreviewProfileImage;
