import { Appearance } from "react-native";
let colorScheme = Appearance.getColorScheme();
const themeStyle =
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
            higher: "#525252",
            high: "#a1a1aa",
            low: "#a3a3a3",
            lower: "#F1F1F1",
            lowest: "#FFFFFF",
          },
          black: "#000000",
          white: "#FFFFFF",
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
            lower: "#6C6C6C",
            low: "#A2A2A2",
            high: "#D2D2D2",
            higher: "#F1F1F1",
            highest: "#FFFFFF",
          },
          black: "#000000",
          white: "#FFFFFF",
        },
      };
export default themeStyle;
