import themeStyle from "../../theme.style";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const PostCardLoader = ({ screenWidth }) => (
  <SkeletonPlaceholder
    backgroundColor={themeStyle.colors.grayscale.cards}
    highlightColor={themeStyle.colors.grayscale.higher}
  >
    <SkeletonPlaceholder.Item
      padding={5}
      width={screenWidth}
      height={screenWidth + 100}
      marginBottom={50}
    >
      <SkeletonPlaceholder.Item flexDirection={"row"} alignItems={"center"}>
        <SkeletonPlaceholder.Item
          height={50}
          width={50}
          borderRadius={30}
          marginRight={20}
        ></SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item width={100} height={10} marginBottom={5} />
          <SkeletonPlaceholder.Item width={100} height={10} marginBottom={5} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
      <SkeletonPlaceholder.Item
        height={screenWidth - 100}
        width={screenWidth - 10}
        alignSelf={"center"}
        marginTop={20}
      ></SkeletonPlaceholder.Item>
      <SkeletonPlaceholder.Item
        height={10}
        marginBottom={5}
        marginTop={10}
        width={screenWidth - 20}
      ></SkeletonPlaceholder.Item>
      <SkeletonPlaceholder.Item
        height={10}
        marginBottom={5}
        width={screenWidth - 20}
      ></SkeletonPlaceholder.Item>
      <SkeletonPlaceholder.Item
        height={10}
        marginBottom={5}
        width={100}
      ></SkeletonPlaceholder.Item>
      <SkeletonPlaceholder.Item
        justifyContent="space-between"
        flexDirection="row"
      >
        <SkeletonPlaceholder.Item flexDirection="row">
          <SkeletonPlaceholder.Item
            height={24}
            width={24}
            borderRadius={12}
            marginTop={15}
            marginRight={20}
          ></SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item
            height={24}
            width={24}
            borderRadius={12}
            marginTop={15}
            marginRight={20}
          ></SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item
          height={24}
          width={24}
          borderRadius={12}
          marginTop={15}
          marginRight={20}
        ></SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
      <SkeletonPlaceholder.Item
        height={10}
        width={50}
        marginBottom={15}
        marginTop={20}
      ></SkeletonPlaceholder.Item>
      <SkeletonPlaceholder.Item
        height={10}
        width={50}
        marginBottom={15}
      ></SkeletonPlaceholder.Item>
    </SkeletonPlaceholder.Item>
    <SkeletonPlaceholder.Item
      height={2}
      marginBottom={10}
      backgroundColor={themeStyle.colors.grayscale.cardsOuter}
    ></SkeletonPlaceholder.Item>
  </SkeletonPlaceholder>
);

export default PostCardLoader;
