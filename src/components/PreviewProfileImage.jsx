import { Dimensions, Image, View } from "react-native";
import themeStyle from "../theme.style";

const PreviewProfileImage = ({ url, headers }) => {
  const { width: screenWidth } = Dimensions.get("window");
  return (
    <View style={{ elevation: 22 }}>
      <Image
        source={{ uri: url, headers }}
        style={{
          width: screenWidth - 10,
          height: screenWidth - 10,
          maxWidth: 900 - 10,
          alignSelf: "center",
          borderRadius: 5,
          borderWidth: 2,
          borderColor: themeStyle.colors.grayscale.lowest,
        }}
      />
    </View>
  );
};

export default PreviewProfileImage;
