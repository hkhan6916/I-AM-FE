import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { View } from "react-native";
import themeStyle from "../../theme.style";

const PostCardLoader = ({ hasImage, screenWidth }) => (
  <View
    style={{
      backgroundColor: themeStyle.colors.grayscale.cards,
      marginVertical: 2,
    }}
  >
    <ContentLoader
      backgroundColor={themeStyle.colors.grayscale.higher}
      foregroundColor={themeStyle.colors.grayscale.high}
      viewBox={`0 0 ${screenWidth} ${screenWidth + 200}`}
      width={screenWidth}
      height={screenWidth + 200}
    >
      <Circle cx="31" cy="31" r="25" />
      <Rect x="75" y="18" rx="2" ry="2" width="140" height="10" />
      <Rect x="75" y="34" rx="2" ry="2" width="140" height="10" />
      {hasImage ? (
        <Rect
          x="0"
          y="60"
          rx="2"
          ry="2"
          width={`${screenWidth}`}
          height={`${screenWidth}`}
        />
      ) : null}
      <Circle cx="20" cy={`${screenWidth + 80}`} r="13" />
      <Circle cx="60" cy={`${screenWidth + 80}`} r="13" />
      <Rect
        x="5"
        y={`${screenWidth + 120}`}
        rx="5"
        ry="5"
        width={`${screenWidth - 10}`}
        height="10"
      />
      <Rect
        x="5"
        y={`${screenWidth + 140}`}
        rx="5"
        ry="5"
        width={`${screenWidth - 10}`}
        height="10"
      />
      <Rect
        x="5"
        y={`${screenWidth + 160}`}
        rx="5"
        ry="5"
        width={`${screenWidth - 50}`}
        height="10"
      />
    </ContentLoader>
  </View>
);

export default PostCardLoader;
