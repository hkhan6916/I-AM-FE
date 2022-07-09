import { Animated } from "react-native";

export const startAnimationHelper = (animation, duration) => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration,
        useNativeDriver: false,
      }),
      Animated.timing(animation, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }),
    ])
  ).start();
};

export const getInterpolatedColor = (animation) =>
  animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#a3a3a3", "#fff"],
  });

export const paragraphInitialStyles = (index, pHeight, pWidth) => {
  let height = pHeight;
  let width = pWidth;
  if (pWidth.constructor === Array) {
    width = pWidth[index] || "100%";
  }
  if (pHeight.constructor === Array) {
    height = pHeight[index] || 8;
  }
  return {
    height,
    width,
  };
};
export const commonDefaultProps = {
  primaryColor: "rgba(220, 220, 220, 1)",
  secondaryColor: "rgba(200, 200, 200, 1)",
  animationDuration: 500,
  loading: null,
  active: false,
  title: true,
  listSize: 1,
  titleStyles: {},
  avatar: false,
  aShape: "circle",
  aSize: "default",
  reverse: false,
  containerStyles: {},
};
