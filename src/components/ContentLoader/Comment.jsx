import themeStyle from "../../theme.style";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const Comment = () => {
  return (
    <SkeletonPlaceholder
      backgroundColor={themeStyle.colors.grayscale.low}
      highlightColor={themeStyle.colors.grayscale.cardContentSkeletonHighlight}
    >
      <SkeletonPlaceholder.Item padding={5} width={"100%"} marginBottom={20}>
        <SkeletonPlaceholder.Item flexDirection={"row"} alignItems={"center"}>
          <SkeletonPlaceholder.Item
            height={40}
            width={40}
            borderRadius={30}
            marginRight={20}
          ></SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item
              width={100}
              height={10}
              marginBottom={5}
            />
            <SkeletonPlaceholder.Item width={100} height={10} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item
          height={10}
          width={"95%"}
          marginTop={10}
          marginHorizontal={5}
        ></SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item
          height={10}
          width={100}
          marginTop={10}
          marginHorizontal={5}
        ></SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
      <SkeletonPlaceholder.Item
        flexDirection="row"
        alignItems="center"
        paddingHorizontal={10}
        marginBottom={30}
      >
        <SkeletonPlaceholder.Item
          height={24}
          width={24}
          borderRadius={12}
          marginRight={20}
        ></SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item
          height={10}
          width={50}
        ></SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

export default Comment;
