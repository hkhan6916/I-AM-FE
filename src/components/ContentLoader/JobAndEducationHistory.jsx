import themeStyle from "../../theme.style";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { Dimensions, View } from "react-native";

const JobAndEducationHistoryLoader = () => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  return (
    <SkeletonPlaceholder
      backgroundColor={themeStyle.colors.grayscale.low}
      highlightColor={themeStyle.colors.grayscale.cardContentSkeletonHighlight}
    >
      <SkeletonPlaceholder.Item padding={5} width={"100%"} marginBottom={20}>
        <SkeletonPlaceholder.Item
          flexDirection={"row"}
          alignItems={"flex-start"}
        >
          <SkeletonPlaceholder.Item
            height={40}
            width={40}
            marginRight={30}
          ></SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item
              width={screenWidth - 50}
              height={10}
              marginBottom={5}
            />
            <SkeletonPlaceholder.Item
              width={screenWidth - 50}
              height={10}
              marginTop={5}
            />
            <SkeletonPlaceholder.Item
              width={screenWidth - 50}
              height={10}
              marginTop={5}
            />
            <SkeletonPlaceholder.Item
              width={screenWidth - 50}
              height={10}
              marginTop={5}
            />
            <SkeletonPlaceholder.Item width={"40%"} height={10} marginTop={5} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

export default JobAndEducationHistoryLoader;
