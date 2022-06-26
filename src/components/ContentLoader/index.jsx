import * as React from "react";
import { useEffect, useState } from "react";
import { Animated, View, StyleSheet } from "react-native";
import {
  getInterpolatedColor,
  startAnimationHelper,
  commonDefaultProps,
  paragraphInitialStyles,
} from "./helpers";

const ContentLoader = ({
  active,
  showAvatar,
  isProfileVideo,
  isInput,
  isSquare,
  pHeight,
  pWidth,
  pRows,
  paragraphStyles,
  tHeight,
  tWidth,
  titleStyles,
  secondaryTitleStyles,
  sTWidth,
  avatarSize,
  avatarStyles,
  reverse,
  containerStyles,
  loading,
  listSize,
  primaryColor,
  secondaryColor,
  customBackground,
  children,
  hideExtraText,
  style,
}) => {
  const [animation, setAnimation] = useState(new Animated.Value(0));
  const startAnimation = () => {
    startAnimationHelper(animation, 700);
  };

  useEffect(() => {
    if (active) {
      startAnimation();
    }
  }, []);

  useEffect(() => {
    if (loading) {
      startAnimation();
    }
  }, [loading]);

  const interpolatedBackground = getInterpolatedColor(
    animation,
    primaryColor,
    secondaryColor
  );

  if (loading === false) {
    return children || null;
  }

  const titleInitialStyles = {
    height: tHeight,
    width: tWidth,
  };
  const secondaryTitleInitialStyles = {
    height: tHeight,
    width: sTWidth,
  };
  const inputInitialStyles = {
    height: 48,
    width: "100%",
    paddingHorizontal: 20,
  };
  const avatarInitialStyles = {
    height: avatarSize,
    width: avatarSize || avatarSize,
    borderRadius: avatarSize / 2,
    marginRight: reverse ? 0 : 10,
    marginLeft: reverse ? 10 : 0,
  };
  const fullWidthStyles = {
    height: "100%",
    width: "100%",
  };

  if (isInput) {
    return (
      <View style={{ margin: 10 }}>
        <Animated.View
          style={[
            styles.label,
            { backgroundColor: customBackground || interpolatedBackground },
          ]}
        />
        <Animated.View
          style={[
            styles.input,
            inputInitialStyles,
            secondaryTitleStyles,
            { backgroundColor: customBackground || interpolatedBackground },
          ]}
        />
      </View>
    );
  }

  if (isSquare) {
    return (
      <Animated.View
        style={[
          fullWidthStyles,
          { backgroundColor: customBackground || interpolatedBackground },
          style && style,
        ]}
      />
    );
  }

  if (isProfileVideo) {
    return (
      <Animated.View
        style={[
          fullWidthStyles,
          avatarStyles,
          { backgroundColor: customBackground || interpolatedBackground },
        ]}
      />
    );
  }
  return [...Array(listSize)].map((_, index) => (
    <View key={index} style={{ width: "100%", marginVertical: 8 }}>
      <View
        style={[
          styles.container,
          { flexDirection: reverse ? "row-reverse" : "row" },
          containerStyles,
        ]}
      >
        {showAvatar ? (
          <Animated.View
            style={[
              styles.avatar,
              avatarInitialStyles,
              avatarStyles,
              { backgroundColor: customBackground || interpolatedBackground },
            ]}
          />
        ) : null}

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.title,
              titleInitialStyles,
              titleStyles,
              { backgroundColor: customBackground || interpolatedBackground },
            ]}
          />
          <Animated.View
            style={[
              styles.secondaryTitle,
              secondaryTitleInitialStyles,
              secondaryTitleStyles,
              { backgroundColor: customBackground || interpolatedBackground },
            ]}
          />
        </View>
      </View>
      {!hideExtraText ? (
        <View style={styles.paragraphContainer}>
          {[...Array(pRows)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.paragraph,
                paragraphInitialStyles(index, pHeight, pWidth),
                paragraphStyles,
                { backgroundColor: customBackground || interpolatedBackground },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  ));
};

ContentLoader.defaultProps = {
  ...commonDefaultProps,
  pHeight: 7,
  pWidth: ["85%", "95%", "75%"],
  pRows: 3,
  tWidth: "50%",
  tHeight: 7,
  sTWidth: "30%",
  paragraphStyles: {},
  secondaryTitleStyles: {},
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 10,
    alignItems: "center",
  },

  content: {
    flex: 1,
    marginLeft: 0,
  },
  avatar: {
    borderRadius: 2,
    marginLeft: 10,
  },
  title: {
    marginBottom: 12,
    borderRadius: 3,
  },
  secondaryTitle: {
    marginBottom: 10,
    borderRadius: 3,
  },
  paragraph: {
    marginVertical: 7,
    borderRadius: 3,
    height: 10,
  },
  label: {
    marginVertical: 7,
    width: 100,
    borderRadius: 3,
    height: 10,
  },
  paragraphContainer: {
    paddingHorizontal: 12,
    marginTop: 10,
  },
});
export default ContentLoader;
