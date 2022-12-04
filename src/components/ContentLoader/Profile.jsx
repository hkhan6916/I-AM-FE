import themeStyle from "../../theme.style";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { Dimensions, View } from "react-native";

const ProfileLoader = () => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  return (
    <View>
      <SkeletonPlaceholder
        backgroundColor={themeStyle.colors.grayscale.low}
        highlightColor={
          themeStyle.colors.grayscale.cardContentSkeletonHighlight
        }
      >
        <SkeletonPlaceholder.Item
          width={screenWidth}
          height={screenWidth}
          aspectRatio={1}
          maxHeight={900}
          maxWidth={900}
        ></SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
        >
          <SkeletonPlaceholder.Item
            width={screenWidth - 60}
            height={40}
            marginTop={5}
            maxHeight={900}
            maxWidth={900}
            borderRadius={40}
          ></SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item
            width={40}
            height={40}
            marginTop={5}
            borderRadius={40}
            marginLeft={5}
          ></SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item
          height={10}
          width={100}
          marginTop={10}
          marginLeft={5}
        />
        <SkeletonPlaceholder.Item
          height={10}
          width={100}
          marginTop={10}
          marginLeft={5}
        />
        <SkeletonPlaceholder.Item
          height={10}
          width={150}
          marginTop={10}
          marginLeft={5}
        />
        <SkeletonPlaceholder.Item
          height={10}
          width={screenWidth - 10}
          maxHeight={900}
          marginTop={20}
          alignSelf={"center"}
        />
        <SkeletonPlaceholder.Item
          height={10}
          width={screenWidth - 10}
          maxHeight={900}
          marginTop={5}
          alignSelf={"center"}
        />
        <SkeletonPlaceholder.Item
          height={10}
          width={screenWidth - 200}
          maxHeight={900}
          marginTop={5}
          marginLeft={5}
        />
        <SkeletonPlaceholder.Item
          height={48}
          width={screenWidth - 10}
          maxHeight={900}
          borderRadius={5}
          alignSelf="center"
          marginTop={30}
        />
        <SkeletonPlaceholder.Item
          height={48}
          width={screenWidth - 10}
          borderRadius={5}
          alignSelf="center"
          marginTop={10}
        />
        <SkeletonPlaceholder.Item
          width={screenWidth}
          height={screenWidth}
          maxHeight={900}
          alignSelf="center"
          maxWidth={900}
          marginTop={20}
        ></SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
};

export default ProfileLoader;
