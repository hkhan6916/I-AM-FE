import { Appearance } from "react-native";
let colorScheme = Appearance.getColorScheme();

const theme =
  colorScheme === "dark"
    ? {
        colors: {
          primary: {
            default: "#138294",
            light: "#00cddb",
          },
          secondary: {
            default: "#0085FF",
            bright: "#00ddff",
            light: "#66b5ff",
          },
          warning: {
            default: "#FFB000",
          },
          success: {
            default: "#009966",
          },
          error: {
            default: "#FF0000",
          },
          grayscale: {
            highest: "#000000",
            higher: "#D2D2D2",
            high: "#F1F1F1",
            low: "#6C6C6C",
            lower: "#848484",
            lowest: "#FFFFFF",
          },
          // grayscale: {
          //   black: "#000000",
          //   superLightGray: "#F1F1F1",
          //   lightGray: "#D2D2D2",
          //   mediumGray: "#848484",
          //   darkGray: "#6C6C6C",
          //   white: "#FFFFFF",
          // },
        },
      }
    : {
        colors: {
          primary: {
            default: "#138294",
            light: "#00cddb",
          },
          secondary: {
            default: "#0085FF",
            bright: "#00ddff",
            light: "#66b5ff",
          },
          warning: {
            default: "#FFB000",
          },
          success: {
            default: "#009966",
          },
          error: {
            default: "#FF0000",
          },
          grayscale: {
            lowest: "#000000",
            lower: "#D2D2D2",
            low: "#F1F1F1",
            high: "#6C6C6C",
            higher: "#848484",
            highest: "#FFFFFF",
          },
          black: "#000000",
          white: "#FFFFFF",
          // grayscale: {
          //   white: "#FFFFFF",
          //   black: "#000000",
          //   superLightGray: "#F1F1F1",
          //   lightGray: "#B8B894",
          //   mediumGray: "#848484",
          //   darkGray: "#6C6C6C",
          // },
        },
      };
export default theme;
